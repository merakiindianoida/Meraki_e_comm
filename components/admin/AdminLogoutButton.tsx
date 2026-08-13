"use client";

import { useClerk } from "@clerk/nextjs";

export default function AdminLogoutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/admin/login" })}
      className="text-[var(--muted)] transition hover:text-[var(--accent)]"
    >
      Log Out
    </button>
  );
}
