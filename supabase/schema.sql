-- ===========================================================================
-- 00_my_next : Supabase 스키마
-- ===========================================================================
-- loena_flower Supabase → SQL Editor 에 붙여넣고 RUN.
-- 다이얼로그에서는 "Run and enable RLS" 선택.
-- ---------------------------------------------------------------------------
-- 다른 프로젝트와 같은 Supabase 프로젝트를 공유해도 충돌하지 않도록
-- 모든 테이블에 'youtube_' prefix 사용.
-- RLS 는 켜되 정책은 만들지 않아 anon 키로는 접근 불가.
-- Next.js Server Action 에서 service_role 키로만 접근.
-- ===========================================================================

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS youtube_categories (
    category_id          BIGSERIAL PRIMARY KEY,
    category_name        TEXT NOT NULL UNIQUE,
    category_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 영상 링크 테이블
CREATE TABLE IF NOT EXISTS youtube_links (
    link_id          BIGSERIAL PRIMARY KEY,
    link_category    BIGINT REFERENCES youtube_categories(category_id) ON DELETE SET NULL,
    link_address     TEXT NOT NULL,
    link_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 카테고리별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_youtube_links_category
    ON youtube_links (link_category);

-- 같은 영상 중복 저장 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_youtube_links_address_unique
    ON youtube_links (link_address);

-- RLS 활성화 (정책 없음 = anon 접근 차단, service_role 만 통과)
ALTER TABLE youtube_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_links      ENABLE ROW LEVEL SECURITY;
