import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface AvatarMenuProps {
  initials: string;
  email: string;
  role: string;
  onLogout?: () => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ initials, email, role, onLogout }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 160;

    const left = Math.max(16, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 16));
    const top = Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - menuHeight - 16));

    setMenuPosition({ top, left });
  };

  const handleLogout = async () => {
    onLogout?.();
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleResize = () => updateMenuPosition();
    const handleScroll = () => updateMenuPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.16)] border border-slate-200/80 overflow-hidden z-[70] animate-[fadeIn_160ms_ease-out]"
          style={{
            top: menuPosition?.top ?? 16,
            left: menuPosition?.left ?? 16,
          }}
        >
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <p className="text-sm font-semibold text-slate-900 truncate">{email}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
