"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="nav-item"
        id="menu-btn"
        aria-label="메뉴"
        onClick={() => setOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#FFFFFF"
        >
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
      </button>
      <Sidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
