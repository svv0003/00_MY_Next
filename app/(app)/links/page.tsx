"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./links.module.css";
import { deleteLink, fetchMetadata, listLinks, saveLink, type BookmarkLink } from "./actions";

export default function LinksPage() {
    const [inputUrl, setInputUrl] = useState("");
    const [links, setLinks] = useState<BookmarkLink[]>([]);
    const [swipedId, setSwipedId] = useState<number | null>(null);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 모달 상태
    const [modal, setModal] = useState<{
        url: string;
        title: string;
        image: string | null;
    } | null>(null);

    const refresh = useCallback(async () => {
        try {
            const data = await listLinks();
            setLinks(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "데이터 로드 실패");
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    async function handlePaste() {
        try {
            const text = (await navigator.clipboard.readText()).trim();
            if (!text) { setError("클립보드가 비어있습니다."); return; }
            setInputUrl(text);
            setError(null);
        } catch {
            setError("클립보드 접근 권한이 필요합니다. 직접 붙여넣기 해주세요.");
        }
    }

    async function handleSaveClick() {
        const trimmed = inputUrl.trim();
        if (!trimmed) { setError("URL을 입력하세요."); return; }
        if (!/^https?:\/\//i.test(trimmed)) {
            setError("http:// 또는 https:// 로 시작하는 URL을 입력하세요.");
            return;
        }
        setFetching(true);
        setError(null);
        try {
            const { title, image } = await fetchMetadata(trimmed);
            setModal({ url: trimmed, title, image });
        } catch (e) {
            setError(e instanceof Error ? e.message : "정보 가져오기 실패");
        } finally {
            setFetching(false);
        }
    }

    async function handleConfirmSave(title: string) {
        if (!modal) return;
        try {
            await saveLink(modal.url, title, modal.image);
            setInputUrl("");
            setModal(null);
            await refresh();
        } catch (e) {
            throw e; // 모달 내부에서 처리
        }
    }

    async function handleDelete(id: number) {
        await deleteLink(id);
        if (swipedId === id) setSwipedId(null);
        await refresh();
    }

    useEffect(() => {
        if (swipedId == null) return;
        function onDocClick(e: MouseEvent) {
            const card = document.querySelector(`[data-card-id="${swipedId}"]`);
            if (card && !card.contains(e.target as Node)) setSwipedId(null);
        }
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [swipedId]);

    return (
        <div className="main-container">
            <div className="title-container">
                <p className="words">Links</p>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="url"
                    className={styles.input}
                    placeholder="https://..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyUp={(e) => { if (e.key === "Enter") handleSaveClick(); }}
                    disabled={fetching}
                />
                <button
                    type="button"
                    className={styles.pasteBtn}
                    onClick={handlePaste}
                    disabled={fetching}
                >
                    Paste
                </button>
                <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSaveClick}
                    disabled={fetching}
                >
                    {fetching ? "..." : "Save"}
                </button>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.linkList}>
                {links.map((link) => (
                    <LinkCard
                        key={link.link_id}
                        link={link}
                        swiped={swipedId === link.link_id}
                        onSwipeOpen={() => setSwipedId(link.link_id)}
                        onSwipeClose={() => setSwipedId(null)}
                        onDelete={() => handleDelete(link.link_id)}
                    />
                ))}
                {links.length === 0 && !error && (
                    <p className={styles.emptyMsg}>저장된 링크가 없습니다.</p>
                )}
            </div>

            {modal && (
                <TitleModal
                    initialTitle={modal.title}
                    onConfirm={handleConfirmSave}
                    onCancel={() => setModal(null)}
                />
            )}
        </div>
    );
}

// ─── 제목 입력 모달 ────────────────────────────────────────────────────────────

type TitleModalProps = {
    initialTitle: string;
    onConfirm: (title: string) => Promise<void>;
    onCancel: () => void;
};

function TitleModal({ initialTitle, onConfirm, onCancel }: TitleModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    async function handleConfirm() {
        if (!title.trim()) { setError("제목을 입력하세요."); return; }
        setBusy(true);
        setError(null);
        try {
            await onConfirm(title.trim());
        } catch (e) {
            setError(e instanceof Error ? e.message : "저장 실패");
            setBusy(false);
        }
    }

    return (
        <div className={styles.modalBackdrop} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>제목 입력</h2>
                {error && <p className={styles.modalError}>{error}</p>}
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.modalInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyUp={(e) => { if (e.key === "Enter") handleConfirm(); }}
                    disabled={busy}
                    placeholder="제목을 입력하세요"
                />
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.modalCancel}
                        onClick={onCancel}
                        disabled={busy}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className={styles.modalConfirm}
                        onClick={handleConfirm}
                        disabled={busy || !title.trim()}
                    >
                        {busy ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── 링크 카드 ─────────────────────────────────────────────────────────────────

type CardProps = {
    link: BookmarkLink;
    swiped: boolean;
    onSwipeOpen: () => void;
    onSwipeClose: () => void;
    onDelete: () => void;
};

function LinkCard({ link, swiped, onSwipeOpen, onSwipeClose, onDelete }: CardProps) {
    const [imgFailed, setImgFailed] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{
        startX: number;
        currentX: number;
        hasMoved: boolean;
        slideW: number;
    } | null>(null);
    const swipedRef = useRef(swiped);
    const justDraggedRef = useRef(false);

    const SLIDE_W = 80;

    useEffect(() => {
        swipedRef.current = swiped;
        if (!wrapperRef.current) return;
        wrapperRef.current.style.transition = "";
        wrapperRef.current.style.transform = swiped ? `translateX(-${SLIDE_W}px)` : "";
    }, [swiped]);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        function applyTransform(t: number, withTransition: boolean) {
            const w = wrapperRef.current;
            if (!w) return;
            w.style.transition = withTransition ? "" : "none";
            w.style.transform = `translateX(${t}px)`;
        }

        function onStart(x: number) {
            dragRef.current = { startX: x, currentX: x, hasMoved: false, slideW: SLIDE_W };
            if (wrapperRef.current) wrapperRef.current.style.transition = "none";
        }

        function onMove(x: number) {
            const d = dragRef.current;
            if (!d) return;
            d.currentX = x;
            const dx = x - d.startX;
            if (!d.hasMoved && Math.abs(dx) > 5) d.hasMoved = true;
            if (!d.hasMoved) return;
            const isOpen = swipedRef.current;
            const t = isOpen
                ? Math.min(0, -SLIDE_W + dx)
                : Math.max(-SLIDE_W, Math.min(0, dx));
            applyTransform(t, false);
        }

        function onEnd() {
            const d = dragRef.current;
            if (!d) return;
            dragRef.current = null;
            const dx = d.currentX - d.startX;
            const wasOpen = swipedRef.current;

            if (!d.hasMoved) {
                if (wasOpen) { onSwipeClose(); applyTransform(0, true); }
                else if (wrapperRef.current) wrapperRef.current.style.transition = "";
                return;
            }

            justDraggedRef.current = true;
            setTimeout(() => { justDraggedRef.current = false; }, 350);

            if (wasOpen) {
                if (dx > 50) { onSwipeClose(); applyTransform(0, true); }
                else applyTransform(-SLIDE_W, true);
            } else {
                if (dx < -50) { onSwipeOpen(); applyTransform(-SLIDE_W, true); }
                else applyTransform(0, true);
            }
        }

        function isDeleteTarget(t: EventTarget | null) {
            return (t as HTMLElement | null)?.closest(`.${styles.deleteBtn}`);
        }

        function tStart(e: TouchEvent) { if (!isDeleteTarget(e.target)) onStart(e.touches[0].clientX); }
        function tMove(e: TouchEvent) { if (dragRef.current) onMove(e.touches[0].clientX); }
        function tEnd() { onEnd(); }
        function mDown(e: MouseEvent) { if (!isDeleteTarget(e.target)) onStart(e.clientX); }
        function mMove(e: MouseEvent) { if (dragRef.current) onMove(e.clientX); }
        function mUp() { onEnd(); }

        card.addEventListener("touchstart", tStart, { passive: true });
        document.addEventListener("touchmove", tMove, { passive: true });
        document.addEventListener("touchend", tEnd);
        card.addEventListener("mousedown", mDown);
        document.addEventListener("mousemove", mMove);
        document.addEventListener("mouseup", mUp);

        return () => {
            card.removeEventListener("touchstart", tStart);
            document.removeEventListener("touchmove", tMove);
            document.removeEventListener("touchend", tEnd);
            card.removeEventListener("mousedown", mDown);
            document.removeEventListener("mousemove", mMove);
            document.removeEventListener("mouseup", mUp);
        };
    }, [onSwipeOpen, onSwipeClose]);

    function handleCardClick() {
        if (justDraggedRef.current) return;
        if (swiped) { onSwipeClose(); return; }
        window.open(link.link_url, "_blank", "noopener,noreferrer");
    }

    let domain = "";
    try { domain = new URL(link.link_url).hostname; } catch { domain = link.link_url; }

    return (
        <div ref={cardRef} className={styles.card} data-card-id={link.link_id}>
            <button
                type="button"
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
                삭제
            </button>
            <div ref={wrapperRef} className={styles.cardWrapper} onClick={handleCardClick}>
                {link.link_image && !imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={link.link_image}
                        alt=""
                        className={styles.preview}
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className={styles.noImage}>No Image</div>
                )}
                <div className={styles.cardText}>
                    <span className={styles.cardTitle}>{link.link_title}</span>
                    <span className={styles.cardDomain}>{domain}</span>
                </div>
            </div>
        </div>
    );
}
