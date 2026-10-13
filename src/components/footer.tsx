import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-xl font-black">
            His<span className="text-rose-500">tyra</span>
          </Link>

          <p className="mt-2 text-sm text-slate-400">
            Un autre regard sur le cinéma.
          </p>
        </div>

        <nav
          aria-label="Informations légales"
          className="flex flex-wrap gap-4 text-sm text-slate-400"
        >
          <Link href="/a-propos" className="hover:text-white">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/confidentialite" className="hover:text-white">
            Confidentialité
          </Link>
        </nav>

        <p className="text-xs text-slate-500">
          © 2026 Histyra. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}