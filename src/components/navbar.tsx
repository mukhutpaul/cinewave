
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Film,
  Tv,
  Star,
  Newspaper,
  LayoutDashboard,
  UserRound,
  Settings,
  Users,
  FolderOpen,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clapperboard,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

type UserRole = "USER" | "EDITOR" | "ADMIN";

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[];
};

const publicLinks: NavLink[] = [
  { href: "/films", label: "Films", icon: Film },
  { href: "/series", label: "Séries", icon: Tv },
  { href: "/critiques", label: "Critiques", icon: Star },
  { href: "/actualites", label: "Actualités", icon: Newspaper },
];

const dashboardLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "EDITOR", "ADMIN"],
  },
  {
    href: "/dashboard/profil",
    label: "Mon profil",
    icon: UserRound,
    roles: ["USER", "EDITOR", "ADMIN"],
  },
];

const editorLinks: NavLink[] = [
  {
    href: "/dashboard/films",
    label: "Gestion des films",
    icon: Film,
    roles: ["EDITOR", "ADMIN"],
  },
  {
    href: "/dashboard/series",
    label: "Gestion des séries",
    icon: Tv,
    roles: ["EDITOR", "ADMIN"],
  },
  {
    href: "/dashboard/critiques",
    label: "Gestion des critiques",
    icon: Star,
    roles: ["EDITOR", "ADMIN"],
  },
  {
    href: "/dashboard/actualites",
    label: "Gestion des actualités",
    icon: Newspaper,
    roles: ["EDITOR", "ADMIN"],
  },
  {
    href: "/dashboard/categories",
    label: "Catégories",
    icon: FolderOpen,
    roles: ["EDITOR", "ADMIN"],
  },
];

const adminLinks: NavLink[] = [
  {
    href: "/dashboard/utilisateurs",
    label: "Utilisateurs",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/administration",
    label: "Administration",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/parametres",
    label: "Paramètres",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;
  const role = (user as { role?: UserRole } | undefined)?.role ?? "USER";
  const isAuthenticated = Boolean(user);

  const canAccess = (link: NavLink) =>
    !link.roles || link.roles.includes(role);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  const visibleDashboardLinks = dashboardLinks.filter(canAccess);
  const visibleEditorLinks = editorLinks.filter(canAccess);
  const visibleAdminLinks = adminLinks.filter(canAccess);

  async function handleSignOut() {
    setLoggingOut(true);

    try {
      await signOut();
      setAccountOpen(false);
      setMobileOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setLoggingOut(false);
    }
  }

  function closeMenus() {
    setMobileOpen(false);
    setAccountOpen(false);
  }

  function renderLinks(links: NavLink[]) {
    return links.map(({ href, label, icon: Icon }) => (
      <li key={href}>
        <Link
          href={href}
          onClick={closeMenus}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex items-center gap-2 ${
            isActive(href)
              ? "active font-semibold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Icon size={17} />
          <span>{label}</span>
        </Link>
      </li>
    ));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b14]/95 backdrop-blur-xl">
      <div className="cine-container navbar min-h-16 px-0">
        {/* Logo */}
        <div className="navbar-start">
          <Link
            href="/"
            onClick={closeMenus}
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
            aria-label="CineWave - Accueil"
          >
            <Clapperboard className="text-rose-500" size={28} />
            <span>
              Cine<span className="text-rose-500">Wave</span>
            </span>
          </Link>
        </div>

        {/* Navigation desktop */}
        <nav
          className="navbar-center hidden lg:flex"
          aria-label="Navigation principale"
        >
          <ul className="menu menu-horizontal gap-1 px-0">
            {renderLinks(publicLinks)}
          </ul>
        </nav>

        {/* Actions desktop */}
        <div className="navbar-end gap-2">
          {!isPending && !isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/connexion"
                className="btn btn-ghost btn-sm"
              >
                Connexion
              </Link>

              <Link
                href="/inscription"
                className="btn btn-error btn-sm text-white"
              >
                <UserPlus size={16} />
                Rejoindre
              </Link>
            </div>
          )}

          {isPending && (
            <span className="loading loading-spinner loading-sm text-rose-500" />
          )}

          {!isPending && isAuthenticated && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-2"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <div className="avatar">
                  <div className="w-8 rounded-full bg-rose-500/20">
                    {user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-rose-400">
                        <UserRound size={18} />
                      </div>
                    )}
                  </div>
                </div>

                <span className="max-w-28 truncate">
                  {user?.name || "Mon compte"}
                </span>
              </button>

              {accountOpen && (
                <ul
                  role="menu"
                  className="menu absolute right-0 top-full z-50 mt-2 w-64 rounded-box border border-white/10 bg-[#101522] p-2 shadow-2xl"
                >
                  <li className="menu-title">
                    <span className="truncate">
                      {user?.email}
                    </span>
                    <span className="badge badge-sm badge-error text-white">
                      {role}
                    </span>
                  </li>

                  {renderLinks(visibleDashboardLinks)}
                  {visibleEditorLinks.length > 0 && (
                    <>
                      <li className="menu-title">
                        <span>Gestion des contenus</span>
                      </li>
                      {renderLinks(visibleEditorLinks)}
                    </>
                  )}

                  {visibleAdminLinks.length > 0 && (
                    <>
                      <li className="menu-title">
                        <span>Administration</span>
                      </li>
                      {renderLinks(visibleAdminLinks)}
                    </>
                  )}

                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="mt-2 text-error"
                    >
                      {loggingOut ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <LogOut size={17} />
                      )}
                      {loggingOut ? "Déconnexion..." : "Se déconnecter"}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Bouton menu mobile */}
          <button
            type="button"
            className="btn btn-square btn-ghost lg:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {/* Navigation mobile */}
      {mobileOpen && (
        <div className="cine-container border-t border-white/10 pb-4 pt-3 lg:hidden">
          <nav aria-label="Navigation mobile">
            <ul className="menu w-full gap-1 p-0">
              {renderLinks(publicLinks)}
            </ul>

            <div className="divider my-2" />

            {isPending ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner text-rose-500" />
              </div>
            ) : isAuthenticated ? (
              <>
                <div className="mb-3 flex items-center gap-3 rounded-box bg-white/5 p-3">
                  <div className="avatar placeholder">
                    <div className="w-10 rounded-full bg-rose-500/20 text-rose-400">
                      <span>
                        {(user?.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user?.email}
                    </p>
                    <span className="badge badge-error badge-sm mt-1 text-white">
                      {role}
                    </span>
                  </div>
                </div>

                <ul className="menu w-full gap-1 p-0">
                  {renderLinks(visibleDashboardLinks)}

                  {visibleEditorLinks.length > 0 && (
                    <>
                      <li className="menu-title">
                        <span>Gestion des contenus</span>
                      </li>
                      {renderLinks(visibleEditorLinks)}
                    </>
                  )}

                  {visibleAdminLinks.length > 0 && (
                    <>
                      <li className="menu-title">
                        <span>Administration</span>
                      </li>
                      {renderLinks(visibleAdminLinks)}
                    </>
                  )}

                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="text-error"
                    >
                      <LogOut size={17} />
                      {loggingOut ? "Déconnexion..." : "Se déconnecter"}
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/connexion"
                  onClick={closeMenus}
                  className="btn btn-outline btn-sm"
                >
                  <LogIn size={16} />
                  Connexion
                </Link>

                <Link
                  href="/inscription"
                  onClick={closeMenus}
                  className="btn btn-error btn-sm text-white"
                >
                  <UserPlus size={16} />
                  Rejoindre
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
