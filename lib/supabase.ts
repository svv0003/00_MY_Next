import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 이 모듈은 Server Action 에서만 import 됩니다 (lazy init).
// service_role 키를 사용하므로 절대 클라이언트 컴포넌트에 import 하지 말 것.

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 채워주세요.",
    );
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return _client;
}

export type Category = {
  category_id: number;
  category_name: string;
  category_created_at: string;
};

export type LinkRow = {
  link_id: number;
  link_category: number | null;
  link_address: string;
  link_created_at: string;
};
