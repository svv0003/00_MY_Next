"use server";

import { getSupabase, type Category, type LinkRow } from "@/lib/supabase";

export type LinkWithCategory = LinkRow & {
  category: { category_name: string } | null;
};

// 지정한 이름의 카테고리가 없으면 만들어주고, 있으면 그대로 반환.
// 페이지 진입 시 기본 카테고리("노래")를 보장하는 데 사용.
export async function ensureCategory(name: string): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("카테고리 이름이 비어있습니다.");
  const existing = await getSupabase()
    .from("youtube_categories")
    .select("*")
    .eq("category_name", trimmed)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;
  const inserted = await getSupabase()
    .from("youtube_categories")
    .insert({ category_name: trimmed })
    .select()
    .single();
  if (inserted.error) throw new Error(inserted.error.message);
  return inserted.data;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from("youtube_categories")
    .select("*")
    .order("category_created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(name: string): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("카테고리 이름이 비어있습니다.");
  const { data, error } = await getSupabase()
    .from("youtube_categories")
    .insert({ category_name: trimmed })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await getSupabase()
    .from("youtube_categories")
    .delete()
    .eq("category_id", categoryId);
  if (error) throw new Error(error.message);
}

export async function listLinks(categoryId?: number): Promise<LinkWithCategory[]> {
  let query = getSupabase()
    .from("youtube_links")
    .select("*, category:youtube_categories(category_name)")
    .order("link_created_at", { ascending: false });
  if (typeof categoryId === "number") {
    query = query.eq("link_category", categoryId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as LinkWithCategory[];
}

export async function createLink(
  linkAddress: string,
  categoryId: number,
): Promise<LinkRow> {
  if (!linkAddress) throw new Error("영상 주소가 비어있습니다.");
  const { data, error } = await getSupabase()
    .from("youtube_links")
    .insert({ link_address: linkAddress, link_category: categoryId })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 저장된 영상입니다.");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function deleteLink(linkId: number): Promise<void> {
  const { error } = await getSupabase().from("youtube_links").delete().eq("link_id", linkId);
  if (error) throw new Error(error.message);
}
