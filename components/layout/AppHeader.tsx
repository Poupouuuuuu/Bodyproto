import Link from "next/link";
import Image from "next/image";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-bs-primary/10 bg-bs-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BodyStart Nutrition"
            width={160}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-bs-muted">
          <Link
            href="/consultation/new"
            className="rounded-full px-4 py-2 transition hover:bg-bs-primary/5 hover:text-bs-primary"
          >
            Nouveau test
          </Link>
          <Link
            href="/history"
            className="rounded-full px-4 py-2 transition hover:bg-bs-primary/5 hover:text-bs-primary"
          >
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}
