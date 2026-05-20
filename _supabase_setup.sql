-- ========================================
-- Supabase 设置脚本 — Nous3508.github.io
-- 在 Supabase Dashboard → SQL Editor 中运行
-- ========================================

-- 1. 创建书签表
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. 创建索引（按用户 + 排序）
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_position
  ON bookmarks(user_id, position);

-- 3. 启用行级安全（RLS）
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. 安全策略：用户只能操作自己的书签
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
