"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Category } from "@/lib/supabase";
import styles from "./youtube.module.css";
import CategoryModal from "./CategoryModal";
import FilterModal, { SortOrder } from "./FilterModal";
import {
    createCategory,
    createLink,
    deleteLink,
    ensureCategory,
    listCategories,
    listLinks,
    type LinkWithCategory,
} from "./actions";

const DEFAULT_CATEGORY = "노래";

function parseYouTubeLink(link: string): string | null {
    const trimmed = link.trim();
    if (!trimmed) return null;
    let videoId = "";
    let queryParams = "";
    if (trimmed.includes("youtu.be/")) {
        const [id, params = ""] = trimmed.split("youtu.be/")[1].split("?");
        videoId = id;
        queryParams = params ? `?${params}` : "";
    } else if (trimmed.includes("youtube.com/watch?v=")) {
        const [id, params = ""] = trimmed.split("v=")[1].split("&");
        videoId = id;
        queryParams = params ? `?${params}` : "";
    } else if (trimmed.includes("youtube.com/live/")) {
        const [id, params = ""] = trimmed.split("youtube.com/live/")[1].split("?");
        videoId = id;
        queryParams = params ? `?${params}` : "";
    } else {
        return null;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}${queryParams}`;
}

function extractVideoId(embedURL: string): string {
    const m = embedURL.match(/embed\/([^?]+)/);
    return m ? m[1] : "";
}

export default function YouTubePage() {
    const [inputLink, setInputLink] = useState("");
    const [tempEmbedURL, setTempEmbedURL] = useState<string | null>(null);
    const [savedVideos, setSavedVideos] = useState<LinkWithCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [swipedId, setSwipedId] = useState<number | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    // 빈 배열 = "모두" (전체 표시). 값이 있으면 해당 카테고리만 필터링
    const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([]);
    // 영상 표시 열 수 (1 또는 2)
    const [columns, setColumns] = useState<number>(1);

    const refresh = useCallback(async () => {
        try {
            const [cats, links] = await Promise.all([listCategories(), listLinks()]);
            setCategories(cats);
            setSavedVideos(links);
            setLoadError(null);
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : "데이터 로드 실패");
        }
    }, []);

    // 최초 진입 시 기본 카테고리("노래") 보장 후 데이터 로드
    useEffect(() => {
        (async () => {
            try {
                await ensureCategory(DEFAULT_CATEGORY);
            } catch {
                // 환경변수 누락 등의 이유로 실패해도 refresh 가 에러 처리
            }
            await refresh();
        })();
    }, [refresh]);

    function runSearch(link: string): boolean {
        if (!link.trim()) {
            alert("주소를 입력하세요.");
            return false;
        }
        const url = parseYouTubeLink(link);
        if (!url) {
            alert("올바른 주소를 입력하세요.");
            return false;
        }
        setTempEmbedURL(url);
        return true;
    }

    async function handlePaste() {
        try {
            const text = (await navigator.clipboard.readText()).trim();
            if (!text) {
                alert("클립보드가 비어있습니다.");
                return;
            }
            setInputLink(text);
            if (runSearch(text)) {
                setInputLink(""); // 검색 성공 시 입력값 비우기
            }
        } catch {
            alert("클립보드 접근 권한이 필요합니다. 직접 붙여넣기 해주세요.");
        }
    }

    function handleSaveClick() {
        if (!tempEmbedURL) {
            alert("저장할 동영상이 없습니다.");
            return;
        }
        if (savedVideos.some((v) => v.link_address === tempEmbedURL)) {
            alert("이미 저장된 동영상입니다.");
            return;
        }
        setShowModal(true);
    }

    async function handleConfirmSave(categoryId: number) {
        if (!tempEmbedURL) return;
        await createLink(tempEmbedURL, categoryId);
        setTempEmbedURL(null);
        setInputLink("");
        setShowModal(false);
        await refresh();
    }

    async function handleCreateCategory(name: string) {
        const created = await createCategory(name);
        await refresh();
        return created;
    }

    function toggleFilter(catId: number) {
        setFilterCategoryIds((prev) =>
            prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
        );
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
            if (card && !card.contains(e.target as Node)) {
                setSwipedId(null);
            }
        }

        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [swipedId]);

    return (
        <div className="main-container">
            <div className="title-container">
                <p className="words">Free YouTube Premium</p>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Paste YouTube Link"
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            if (runSearch(inputLink)) setInputLink("");
                        }
                    }}
                />
                <button type="button" className={styles.pasteBtn} onClick={handlePaste}>
                    Paste
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleSaveClick}>
                    Save
                </button>
            </div>

            {loadError && (
                <p style={{color: "#ffb3b3", textAlign: "center", margin: "10px 20px"}}>
                    {loadError}
                </p>
            )}

            <div
                className={styles.videoContainer}
                style={{"--cols": columns} as CSSProperties}
            >
                {tempEmbedURL && (
                    <div className={styles.videoResponsive}>
                        <iframe
                            src={tempEmbedURL}
                            title="YouTube preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                )}
                {(filterCategoryIds.length === 0
                        ? savedVideos
                        : savedVideos.filter(
                            (v) =>
                                v.link_category != null &&
                                filterCategoryIds.includes(v.link_category),
                        )
                ).map((v) => (
                    <SavedVideoCard
                        key={v.link_id}
                        video={v}
                        swiped={swipedId === v.link_id}
                        onSwipeOpen={() => setSwipedId(v.link_id)}
                        onSwipeClose={() => setSwipedId(null)}
                        onDelete={() => handleDelete(v.link_id)}
                    />
                ))}
            </div>

            {showModal && (
                <CategoryModal
                    categories={categories}
                    onCancel={() => setShowModal(false)}
                    onConfirm={handleConfirmSave}
                    onCreateCategory={handleCreateCategory}
                />
            )}

            <button
                type="button"
                className={styles.filterFab}
                onClick={() => setShowFilterModal(true)}
                aria-label="필터"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80%"
                    height="80%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                {filterCategoryIds.length > 0 && (
                    <span className={styles.filterFabBadge}>
            {filterCategoryIds.length}
          </span>
                )}
            </button>

            {showFilterModal && (
                <FilterModal
                    categories={categories}
                    filterCategoryIds={filterCategoryIds}
                    columns={columns}
                    onToggle={toggleFilter}
                    onSelectAll={() => setFilterCategoryIds([])}
                    onColumnsChange={setColumns}
                    onClose={() => setShowFilterModal(false)} sortOrder={"recent"}
                    onSortChange={function (order: SortOrder): void {
                        throw new Error("Function not implemented.");
                    }}        />
      )}
    </div>
  );
}

type CardProps = {
  video: LinkWithCategory;
  swiped: boolean;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onDelete: () => void;
};

function SavedVideoCard({
  video,
  swiped,
  onSwipeOpen,
  onSwipeClose,
  onDelete,
}: CardProps) {
  const [playing, setPlaying] = useState(false);
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

  const ytId = extractVideoId(video.link_address);
  const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  useEffect(() => {
    swipedRef.current = swiped;
    if (!wrapperRef.current || !cardRef.current) return;
    const slideW =
      parseInt(
        getComputedStyle(cardRef.current).getPropertyValue("--slide-w"),
        10,
      ) || 80;
    wrapperRef.current.style.transition = "";
    wrapperRef.current.style.transform = swiped
      ? `translateX(-${slideW}px)`
      : "";
  }, [swiped]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    function getSlideW() {
      return (
        parseInt(
          getComputedStyle(card!).getPropertyValue("--slide-w"),
          10,
        ) || 80
      );
    }

    function applyTransform(t: number, withTransition: boolean) {
      const w = wrapperRef.current;
      if (!w) return;
      w.style.transition = withTransition ? "" : "none";
      w.style.transform = `translateX(${t}px)`;
    }

    function onStart(x: number) {
      dragRef.current = {
        startX: x,
        currentX: x,
        hasMoved: false,
        slideW: getSlideW(),
      };
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
        ? Math.min(0, -d.slideW + dx)
        : Math.max(-d.slideW, Math.min(0, dx));
      applyTransform(t, false);
    }

    function onEnd() {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      const dx = d.currentX - d.startX;
      const wasOpen = swipedRef.current;

      if (!d.hasMoved) {
        if (wasOpen) {
          onSwipeClose();
          applyTransform(0, true);
        } else if (wrapperRef.current) {
          wrapperRef.current.style.transition = "";
        }
        return;
      }

      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 350);

      if (wasOpen) {
        if (dx > 50) {
          onSwipeClose();
          applyTransform(0, true);
        } else {
          applyTransform(-d.slideW, true);
        }
      } else {
        if (dx < -50) {
          onSwipeOpen();
          applyTransform(-d.slideW, true);
        } else {
          applyTransform(0, true);
        }
      }
    }

    function isDeleteTarget(t: EventTarget | null) {
      return (t as HTMLElement | null)?.closest(`.${styles.deleteButton}`);
    }

    function tStart(e: TouchEvent) {
      if (isDeleteTarget(e.target)) return;
      onStart(e.touches[0].clientX);
    }
    function tMove(e: TouchEvent) {
      if (dragRef.current) onMove(e.touches[0].clientX);
    }
    function tEnd() {
      onEnd();
    }
    function mDown(e: MouseEvent) {
      if (isDeleteTarget(e.target)) return;
      onStart(e.clientX);
    }
    function mMove(e: MouseEvent) {
      if (dragRef.current) onMove(e.clientX);
    }
    function mUp() {
      onEnd();
    }

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

  function onThumbClick(e: React.MouseEvent) {
    if (justDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (swiped) {
      onSwipeClose();
      return;
    }
    setPlaying(true);
  }

  const autoplayURL =
    video.link_address +
    (video.link_address.includes("?") ? "&" : "?") +
    "autoplay=1";

  return (
    <div ref={cardRef} className={styles.savedVideo} data-card-id={video.link_id}>
      <button
        type="button"
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        삭제
      </button>
      <div ref={wrapperRef} className={styles.videoWrapper}>
        {video.category?.category_name && (
          <span className={styles.categoryBadge}>
            {video.category.category_name}
          </span>
        )}
        {playing ? (
          <iframe
            src={autoplayURL}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div
            className={styles.videoThumbnail}
            style={{ backgroundImage: `url('${thumbnail}')` }}
            onClick={onThumbClick}
          >
            <button
              type="button"
              className={styles.playBtn}
              tabIndex={-1}
              aria-label="재생"
            >
              <svg viewBox="0 0 68 48" width="68" height="48">
                <path
                  fill="#212121"
                  fillOpacity="0.85"
                  d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                />
                <path d="M 45,24 27,14 27,34" fill="#fff" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
