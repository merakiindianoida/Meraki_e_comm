import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

// Shared chrome for every protected /admin/* page except /admin/login,
// which lives in the sibling (auth) route group specifically so it never
// gets this nav bar. Route groups (parenthesized folders) don't affect the
// URL — /admin still resolves here, /admin/login resolves in (auth).
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--border-strong)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-serif text-xl text-[var(--ink)]">
            Meraki Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm uppercase tracking-[0.1em] text-[var(--ink)]/75">
            <Link href="/admin/products" className="hover:text-[var(--accent)]">
              Products
            </Link>
            <Link href="/admin/orders" className="hover:text-[var(--accent)]">
              Orders
            </Link>
            <Link href="/admin/returns" className="hover:text-[var(--accent)]">
              Returns
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
