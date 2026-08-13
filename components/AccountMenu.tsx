"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

// Custom account trigger + flyout — replaces Clerk's stock <UserButton/>
// popover so the panel can hold our own content (My Orders today; a
// Returns/ratings entry point once those exist) instead of just "Manage
// account / Sign out". Opens on hover for mouse users and on click for
// touch/keyboard, closes on an outside click or Escape. Has to be stateful
// (not the pure-CSS group-hover trick Header's NavDropdown uses) because
// signed-in vs signed-out isn't knowable until Clerk loads client-side.
export default function AccountMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Reserve the icon's footprint while Clerk is still resolving auth state,
  // rather than flashing the signed-out panel first — same effect Clerk's
  // own <Show> gives for free, done by hand here since this is no longer it.
  if (!isLoaded) {
    return <div className="h-10 w-10" />;
  }

  const displayName =
    user?.firstName || user?.primaryEmailAddress?.emailAddress || "there";

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Account"
        className="inline-flex h-10 w-10 items-center justify-center text-[var(--ink)]/70 transition hover:text-[var(--accent)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path
            d="M4.5 20c0-4.14 3.36-6.5 7.5-6.5s7.5 2.36 7.5 6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full z-50 w-64 origin-top-right border border-[var(--border-strong)] bg-white p-4 normal-case tracking-normal shadow-lg transition-all duration-200 ${
          open
            ? "visible translate-y-2 opacity-100"
            : "invisible translate-y-1 opacity-0"
        }`}
      >
        {isSignedIn ? (
          <>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[var(--ink)]">
              {displayName}
            </p>
            <div className="mt-3 space-y-1 border-t border-[var(--border)] pt-3">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="block py-1.5 text-sm text-[var(--ink)] transition hover:text-[var(--accent)]"
              >
                My Orders
              </Link>
              <Link
                href="/account/addresses"
                onClick={() => setOpen(false)}
                className="block py-1.5 text-sm text-[var(--ink)] transition hover:text-[var(--accent)]"
              >
                Saved Addresses
              </Link>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/" })}
                className="block w-full py-1.5 text-left text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--ink)]">Welcome</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              To access your account and manage orders
            </p>
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg bg-[var(--ink)] px-4 py-2.5 text-center text-xs uppercase tracking-[0.15em] text-white transition duration-300 hover:bg-[var(--ink)]/90"
            >
              Login / Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
