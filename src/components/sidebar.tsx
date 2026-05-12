"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import { OrgSwitcher } from "@/components/org-switcher";
import type { Org } from "@/lib/org";

type NavItem = { key: string; label: string; href: string; count?: number };

const NAV: NavItem[] = [
  { key: "home", label: "Home", href: "/home" },
  { key: "prospecting", label: "Prospecting", href: "/prospecting", count: 7 },
  { key: "active", label: "Active Leads", href: "/active", count: 4 },
  { key: "preapproved", label: "Pre-Approved Loans", href: "/preapproved", count: 4 },
  { key: "pipeline", label: "Loan Pipeline", href: "/pipeline", count: 17 },
  { key: "past", label: "Past Clients", href: "/past", count: 128 },
  { key: "partners", label: "Partners", href: "/partners", count: 24 },
  { key: "contacts", label: "Contacts", href: "/contacts", count: 412 },
];

export function Sidebar({
  userEmail,
  orgs,
  currentOrg,
}: {
  userEmail?: string | null;
  orgs: Org[];
  currentOrg: Org | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-[232px] shrink-0 bg-beige-100 border-r border-stroke flex flex-col h-screen">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="w-9 h-9 rounded-lg bg-navy-900 text-beige-100 flex items-center justify-center font-bold">
          M
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-ink-900">MOS</div>
          <div className="text-[11px] text-brown-600 uppercase tracking-wider">Mortgage OS</div>
        </div>
      </div>

      <OrgSwitcher orgs={orgs} currentOrg={currentOrg} />

      <button
        type="button"
        className="mx-4 mb-4 flex items-center gap-2 bg-white border border-stroke rounded-md px-3 py-2 text-sm text-brown-700 hover:border-stroke-strong"
      >
        <span className="text-navy-700 font-bold">+</span>
        Quick add contact
      </button>

      <div className="px-4 pb-2 text-[10px] tracking-[0.16em] uppercase text-brown-500 font-semibold">
        Workspace
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.key}
              href={it.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                active ? "bg-navy-900 text-beige-100" : "text-brown-700 hover:bg-beige-200"
              }`}
            >
              <span>{it.label}</span>
              {it.count != null && (
                <span
                  className={`text-[11px] font-mono ${
                    active ? "text-beige-200" : "text-brown-500"
                  }`}
                >
                  {it.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stroke px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-700 text-beige-100 text-xs flex items-center justify-center font-semibold">
            {(userEmail ?? "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="leading-tight text-xs min-w-0">
            <div className="font-semibold text-ink-900 truncate">{userEmail ?? "Signed out"}</div>
            <div className="text-brown-500 truncate">{currentOrg?.name ?? "—"}</div>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full text-left text-xs text-brown-600 hover:text-red-600 border border-stroke rounded-md px-3 py-1.5"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
