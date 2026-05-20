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

  /** 同步本地书签到云端（合并策略） */
  async syncLocalToCloud(localBookmarks) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    const user = await Auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error('Not logged in');

    // 1. 获取云端已有书签
    const cloudBookmarks = await this.fetchAll();
    const cloudUrls = new Set(cloudBookmarks.map(b => b.url));

    // 2. 找出本地有但云端没有的
    const toAdd = localBookmarks.filter(b => !cloudUrls.has(b.url));

    // 3. 批量添加
    for (const bm of toAdd) {
      await supabaseClient
        .from('bookmarks')
        .insert([{
          user_id: userId,
          title: bm.title,
          url: bm.url,
          position: cloudBookmarks.length + toAdd.indexOf(bm)
        }]);
    }

    // 4. 返回合并后的完整列表
    return this.fetchAll();
  }
};
