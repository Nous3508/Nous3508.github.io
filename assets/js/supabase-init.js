/**
 * supabase-init.js - Supabase 客户端初始化 & API
 *
 * ⚠️ 使用前请替换下方的 SUPABASE_URL 和 SUPABASE_ANON_KEY
 * 在 Supabase Dashboard → Settings → API 中获取
 */
const SUPABASE_URL = 'https://demoupiiptjpucjsxkse.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4UvQ0uf5HPp6K3mfmtI4yA_nE_2ojEM';

// -------- 初始化 Supabase 客户端 --------
let supabaseClient = null;

try {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } else {
    console.warn('[Supabase] SDK not loaded. Auth features disabled.');
  }
} catch (e) {
  console.warn('[Supabase] Init failed:', e.message);
}

// -------- 认证工具 --------
const Auth = {
  /** 获取当前登录用户 */
  async getUser() {
    if (!supabaseClient) return { data: { user: null } };
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) return { data: { user: null } };
    return data?.user ? { data: { user: data.user } } : { data: { user: null } };
  },

  /** 获取 session */
  async getSession() {
    if (!supabaseClient) return { data: { session: null } };
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) return { data: { session: null } };
    return data;
  },

  /** 判断是否已登录 */
  async isLoggedIn() {
    const { data } = await this.getUser();
    return !!data?.user;
  },

  /** GitHub 登录 */
  async signInWithGitHub() {
    if (!supabaseClient) return { error: new Error('Supabase not initialized') };
    return supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/account/'
      }
    });
  },

  /** 退出登录 */
  async signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    // 清除本地收藏缓存
    localStorage.removeItem('nous_cloud_sync_key');
    // 重新加载页面刷新状态
    window.location.href = '/';
  },

  /** 监听认证状态变化 */
  onAuthStateChange(callback) {
    if (!supabaseClient) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};

// -------- 书签云 API --------
const BookmarkAPI = {
  /** 获取用户的所有书签 */
  async fetchAll() {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabaseClient
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /** 添加书签 */
  async add(title, url, position = 0) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error('Not logged in');

    const { data, error } = await supabaseClient
      .from('bookmarks')
      .insert([{ user_id: userId, title, url, position }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  /** 更新书签 */
  async update(id, updates) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const { data, error } = await supabaseClient
      .from('bookmarks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  /** 删除书签 */
  async remove(id) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const { error } = await supabaseClient
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /** 同步本地书签到云端（全量合并策略）
   *
   *  以本地顺序为基准，将本地书签的完整顺序、标题同步到云端：
   *    - 本地有 & 云端有  → 更新 position + title
   *    - 本地有 & 云端无  → 插入新记录
   *    - 本地无 & 云端有  → 删除云端记录
   *  同步完成后返回云端最新列表（与本地一致）。
   */
  async syncLocalToCloud(localBookmarks) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error('Not logged in');

    // 1. 获取云端已有书签
    const cloudBookmarks = await this.fetchAll();

    // 建立云端 URL → 记录的映射
    const cloudMap = new Map();
    for (const cb of cloudBookmarks) {
      cloudMap.set(cb.url, cb);
    }

    // 2. 遍历本地书签，按顺序同步
    for (let i = 0; i < localBookmarks.length; i++) {
      const bm = localBookmarks[i];
      const existing = cloudMap.get(bm.url);

      if (existing) {
        // 已存在 → 更新位置和标题（如果变了的话）
        if (existing.position !== i || existing.title !== bm.title) {
          await this.update(existing.id, { position: i, title: bm.title });
        }
        // 从 map 中移除，剩下的就是要删除的
        cloudMap.delete(bm.url);
      } else {
        // 不存在 → 插入
        await this.add(bm.title, bm.url, i);
      }
    }

    // 3. 删除云端有但本地已没有的书签
    for (const [, cb] of cloudMap) {
      await this.remove(cb.id);
    }

    // 4. 重新拉取云端最新列表
    return this.fetchAll();
  },

  /** 清空云端所有书签，再插入本地全部书签（覆盖策略）
   *
   *  以本地顺序为准，云端旧数据全部删除后重新写入。
   *  避免了合并策略下重复 URL 遗留的问题。
   */
  async replaceAll(localBookmarks) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error('Not logged in');

    // 1. 删除云端所有书签（批量删除）
    const existing = await this.fetchAll();
    for (const cb of existing) {
      await this.remove(cb.id);
    }

    // 2. 依次插入本地书签
    for (let i = 0; i < localBookmarks.length; i++) {
      const bm = localBookmarks[i];
      await this.add(bm.title, bm.url, i);
    }

    return this.fetchAll();
  }
};

// -------- 首页文案 API --------
const HomepageSettings = {
  /** 获取当前用户的首页个性化文案 */
  async fetch() {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabaseClient
      .from('homepage_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  /** 保存首页文案设置（upsert） */
  async save(settings) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error('Not logged in');

    const payload = {
      user_id: userId,
      eyebrow_en: settings.eyebrow_en || '',
      eyebrow_zh: settings.eyebrow_zh || '',
      title_en: settings.title_en || '',
      title_zh: settings.title_zh || '',
      desc_en: settings.desc_en || '',
      desc_zh: settings.desc_zh || '',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from('homepage_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    return data?.[0];
  }
};
