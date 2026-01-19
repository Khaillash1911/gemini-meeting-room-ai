"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ dynamicSegments = {} }) {
  const pathname = usePathname();

  // Define readable names for path segments
  const routeNameMap = {
    admin: "Admin",
    public: "Dashboard",
    book: "All Rooms",
    "create-room": "Create Room",
    "edit-room": "All Rooms",
    rooms: "All Rooms",
  };

  const segmentLinkMap = {
    "edit-room": "/admin/rooms",
    "book": "/public/book", // public/book/123 -> "All Rooms" -> public/book
  };

  const getBreadcrumbs = () => {
    // Remove query parameters and trailing slashes
    const asPathWithoutQuery = pathname.split("?")[0];
    const asPathNestedRoutes = asPathWithoutQuery
      .split("/")
      .filter((v) => v.length > 0);

    // Build the breadcrumb array
    const crumblist = asPathNestedRoutes.map((subpath, idx) => {
      let href = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");
      
      if (segmentLinkMap[subpath]) {
          href = segmentLinkMap[subpath];
      }
      
      const isLast = idx === asPathNestedRoutes.length - 1;
      
      // Determine display title
      // 1. Check if there's a dynamic override for this segment (used for IDs)
      // 2. Check the static map
      // 3. Fallback to the segment itself
      let title = dynamicSegments[subpath] || routeNameMap[subpath] || subpath;
      
      // Handle IDs (simple heuristic: if it looks like an ID or is undetermined)
      // Only default to "Details" if we don't have a specific override or map
      if (!dynamicSegments[subpath] && !routeNameMap[subpath] && (subpath.length > 20 || !isNaN(subpath))) {
        title = "Details";
      }

      // Capitalize if not mapped and not an ID we just generalized
      if (!dynamicSegments[subpath] && !routeNameMap[subpath] && title !== "Details") {
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      return { href, title, isLast };
    });

    return crumblist;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm">
      <ol className="flex items-center gap-1">
        {/*
           Instead of linking Home icon to '/', which is the landing page,
           we should link it to the root of the current dashboard context if possible,
           OR keep it as '/' if that's the "App Home".
           User requested: "home icon brings to the dashboard not the landing page".
           
           Since this component is generic, we can check the first segment.
        */}
        <li>
          <Link
            href={pathname.startsWith("/admin") ? "/admin" : "/public"}
            className="flex items-center text-[var(--page-muted)] transition hover:text-[var(--accent)]"
          >
            <Home size={14} />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-[var(--border)]" />
            {crumb.isLast ? (
              <span className="font-medium text-[var(--page-text)]">
                {crumb.title}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[var(--page-muted)] transition hover:text-[var(--accent)]"
              >
                {crumb.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
