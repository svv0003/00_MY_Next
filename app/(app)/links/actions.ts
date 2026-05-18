"use server";

import { getSupabase } from "@/lib/supabase";

export type BookmarkLink = {
    link_id: number;
    link_url: string;
    link_title: string;
    link_image: string | null;
    link_created_at: string;
};

function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
}

function toAbsoluteUrl(src: string, base: string): string {
    try {
        return new URL(src, base).href;
    } catch {
        return src;
    }
}

export async function fetchMetadata(url: string): Promise<{ title: string; image: string | null }> {
    const trimmed = url.trim();

    let domain = "";
    try {
        domain = new URL(trimmed).hostname;
    } catch {
        throw new Error("올바른 URL을 입력하세요.");
    }

    let title = domain;
    let image: string | null = null;

    try {
        const res = await fetch(trimmed, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Twitterbot/1.0)",
                Accept: "text/html",
            },
            signal: AbortSignal.timeout(7000),
        });
        const html = await res.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) title = decodeHtmlEntities(titleMatch[1].trim());

        const ogTitle =
            html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1];
        if (ogTitle) title = decodeHtmlEntities(ogTitle.trim());

        const ogImage =
            html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ??
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
        if (ogImage) {
            image = toAbsoluteUrl(decodeHtmlEntities(ogImage.trim()), trimmed);
        }
    } catch {
        // defaults
    }

    return { title, image };
}

export async function saveLink(
    url: string,
    title: string,
    image: string | null,
): Promise<BookmarkLink> {
    if (!url) throw new Error("URL을 입력하세요.");
    if (!title.trim()) throw new Error("제목을 입력하세요.");

    const row: Record<string, unknown> = {
        link_url: url.trim(),
        link_title: title.trim(),
    };
    if (image) row.link_image = image;

    const { data, error } = await getSupabase()
        .from("bookmark_links")
        .insert(row)
        .select()
        .single();

    if (error) {
        if (error.code === "23505") throw new Error("이미 저장된 링크입니다.");
        throw new Error(error.message);
    }
    return data;
}

export async function listLinks(): Promise<BookmarkLink[]> {
    const { data, error } = await getSupabase()
        .from("bookmark_links")
        .select("*")
        .order("link_created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function deleteLink(id: number): Promise<void> {
    const { error } = await getSupabase()
        .from("bookmark_links")
        .delete()
        .eq("link_id", id);
    if (error) throw new Error(error.message);
}
