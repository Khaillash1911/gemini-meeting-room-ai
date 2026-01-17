"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function DashboardSidebar({
  title,
  subtitle,
  items = [],
  footer = null,
}) {
  const [open, setOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash || "");
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActive = (href) => {
    if (!href) return false;
    const [basePath, hash] = href.split("#");
    if (basePath === "/") return pathname === "/";
    if (hash) {
      return pathname === basePath && currentHash === `#${hash}`;
    }
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "border border-[var(--sidebar-active-border)] bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
            : "text-[var(--sidebar-text)] opacity-80 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)] hover:opacity-100"
        }`}
      >
        {Icon && <Icon size={18} />}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 border-b border-[var(--sidebar-border)] bg-[var(--page-bg)]/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--sidebar-border)] text-[var(--page-text)] hover:bg-black/5"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="text-sm font-semibold text-[var(--page-text)]">{title}</div>
          <span className="h-9 w-9" />
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-6 p-4">
          <div className="flex items-start justify-between">
            <div>
              {subtitle && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">
                  {subtitle}
                </p>
              )}
              <p className="text-lg font-semibold text-[var(--sidebar-text)]">{title}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--sidebar-border)] text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)]"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-4">
            {items.map((item) => {
              if (item.children?.length) {
                return (
                  <div key={item.label} className="space-y-2">
                    <p className="px-3 text-[11px] uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">
                      {item.label}
                    </p>
                    <div className="space-y-1">
                      {item.children.map((child) => renderItem(child))}
                    </div>
                  </div>
                );
              }

              return renderItem(item);
            })}
          </nav>

          {footer && (
            <div className="mt-auto border-t border-[var(--sidebar-border)] pt-4">{footer}</div>
          )}
        </div>
      </aside>
    </>
  );
}
