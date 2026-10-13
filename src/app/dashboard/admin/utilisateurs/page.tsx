import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";
import { ToastFeedback } from "@/components/ui/ToastFeedback";
import { UserSearch } from "@/components/dashboard/UserSearch";

const PAGE_PATH = "/dashboard/admin/utilisateurs";

const VALID_ROLES: UserRole[] = ["USER", "EDITOR", "ADMIN"];

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    redirect("/connexion");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

async function updateUserRole(formData: FormData) {
  "use server";

  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!userId || !VALID_ROLES.includes(role as UserRole)) {
    redirect(`${PAGE_PATH}?erreur=donnees-invalides`);
  }

  if (userId === admin.id) {
    redirect(`${PAGE_PATH}?erreur=modification-propre-compte`);
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });

  if (!target) {
    redirect(`${PAGE_PATH}?erreur=utilisateur-introuvable`);
  }

  // Empêche de retirer le rôle au dernier administrateur actif.
  if (!target.banned && target.role === "ADMIN" && role !== "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        banned: false,
      },
    });

    if (activeAdmins <= 1) {
      redirect(`${PAGE_PATH}?erreur=dernier-admin`);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as UserRole },
  });

  revalidatePath(PAGE_PATH);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");

  redirect(`${PAGE_PATH}?message=role-modifie`);
}

async function toggleUserBan(formData: FormData) {
  "use server";

  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    redirect(`${PAGE_PATH}?erreur=donnees-invalides`);
  }

  if (userId === admin.id) {
    redirect(`${PAGE_PATH}?erreur=modification-propre-compte`);
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      banned: true,
      role: true,
    },
  });

  if (!target) {
    redirect(`${PAGE_PATH}?erreur=utilisateur-introuvable`);
  }

  // Un administrateur actif ne peut pas bannir le dernier administrateur actif.
  if (!target.banned && target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: {
        role: "ADMIN",
        banned: false,
      },
    });

    if (activeAdmins <= 1) {
      redirect(`${PAGE_PATH}?erreur=dernier-admin`);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { banned: !target.banned },
  });

  revalidatePath(PAGE_PATH);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");

  redirect(
    `${PAGE_PATH}?message=${
      target.banned ? "compte-reactive" : "compte-banni"
    }`,
  );
}

type PageProps = {
  searchParams: Promise<{
    q?: string;
    message?: string;
    erreur?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = (params.q ?? "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
  });

  const [totalUsers, totalAdmins, totalEditors, bannedUsers, activeAdmins] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: "ADMIN" },
      }),
      prisma.user.count({
        where: { role: "EDITOR" },
      }),
      prisma.user.count({
        where: { banned: true },
      }),
      prisma.user.count({
        where: {
          role: "ADMIN",
          banned: false,
        },
      }),
    ]);

  const stats = [
    {
      label: "Comptes au total",
      value: totalUsers,
      icon: "👥",
      color: "text-white",
    },
    {
      label: "Administrateurs",
      value: totalAdmins,
      icon: "🛡️",
      color: "text-rose-400",
    },
    {
      label: "Éditeurs",
      value: totalEditors,
      icon: "✍️",
      color: "text-violet-400",
    },
    {
      label: "Comptes bannis",
      value: bannedUsers,
      icon: "🚫",
      color: "text-amber-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <ToastFeedback message={params.message} erreur={params.erreur} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <header className="mb-8">
          <Link
            href="/dashboard/admin"
            className="text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Retour à l’administration
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
                CineWave · Administration
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Gestion des utilisateurs
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Consultez les comptes, recherchez des membres et gérez leurs
                rôles ainsi que leur accès à la plateforme.
              </p>
            </div>

            <Link href="/dashboard" className="btn btn-outline border-white/15">
              Mon dashboard
            </Link>
          </div>
        </header>

        <section
          aria-label="Statistiques des utilisateurs"
          className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span aria-hidden="true" className="text-2xl">
                  {stat.icon}
                </span>
                <span className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-400">{stat.label}</p>
            </article>
          ))}
        </section>

        {/* Recherche automatique : le champ met à jour ?q= après 350 ms. */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <UserSearch initialQuery={query} />

          <p className="mt-3 text-xs text-slate-500">
            Affichage limité aux 200 comptes les plus récents. La recherche
            filtre automatiquement par nom ou adresse e-mail.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Comptes utilisateurs</h2>
              <p className="mt-1 text-sm text-slate-400">
                {users.length} résultat(s)
                {query ? ` pour « ${query} »` : ""}
              </p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl">🔎</p>
              <h3 className="mt-4 text-lg font-bold">
                Aucun utilisateur trouvé
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Essayez un autre nom ou une autre adresse e-mail.
              </p>
            </div>
          ) : (
            <>
              {/* Affichage mobile */}
              <div className="divide-y divide-white/10 md:hidden">
                {users.map((user) => (
                  <article key={user.id} className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-lg font-black">
                          {(user.name || user.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="break-words font-bold">
                          {user.name || "Sans nom"}
                        </p>
                        <p className="break-all text-sm text-slate-400">
                          {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`badge badge-sm ${
                              user.banned ? "badge-error" : "badge-success"
                            }`}
                          >
                            {user.banned ? "Banni" : "Actif"}
                          </span>
                          <span className="badge badge-sm badge-outline border-white/20">
                            {user.emailVerified
                              ? "E-mail vérifié"
                              : "E-mail non vérifié"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Inscrit le{" "}
                      {user.createdAt.toLocaleDateString("fr-FR")}
                    </p>

                    <form
                      action={updateUserRole}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <label
                        htmlFor={`role-mobile-${user.id}`}
                        className="sr-only"
                      >
                        Rôle de {user.name || user.email}
                      </label>
                      <select
                        id={`role-mobile-${user.id}`}
                        name="role"
                        defaultValue={user.role}
                        className="select select-bordered min-w-0 flex-1 border-white/10 bg-[#080b14] text-white"
                      >
                        <option value="USER">Membre</option>
                        <option value="EDITOR">Éditeur</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                      <button
                        type="submit"
                        className="btn btn-sm btn-outline border-white/20"
                      >
                        Enregistrer
                      </button>
                    </form>

                    <form action={toggleUserBan}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        disabled={
                          user.role === "ADMIN" &&
                          !user.banned &&
                          activeAdmins <= 1
                        }
                        className={`btn btn-sm w-full ${
                          user.banned
                            ? "btn-success"
                            : "btn-outline border-red-500/40 text-red-300 hover:bg-red-500/10"
                        }`}
                      >
                        {user.banned ? "Réactiver le compte" : "Bannir le compte"}
                      </button>
                    </form>
                  </article>
                ))}
              </div>

              {/* Tableau desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="table">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Inscription</th>
                      <th className="min-w-72">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/[0.025]"
                      >
                        <td>
                          <div className="flex min-w-56 items-center gap-3">
                            {user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.image}
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 font-black">
                                {(user.name || user.email || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-bold">
                                {user.name || "Sans nom"}
                              </p>
                              <p className="max-w-56 truncate text-xs text-slate-400">
                                {user.email}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {user.emailVerified
                                  ? "E-mail vérifié"
                                  : "E-mail non vérifié"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`badge badge-outline ${
                              user.role === "ADMIN"
                                ? "border-rose-500/50 text-rose-300"
                                : user.role === "EDITOR"
                                  ? "border-violet-500/50 text-violet-300"
                                  : "border-white/20 text-slate-300"
                            }`}
                          >
                            {user.role === "ADMIN"
                              ? "Administrateur"
                              : user.role === "EDITOR"
                                ? "Éditeur"
                                : "Membre"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              user.banned ? "badge-error" : "badge-success"
                            }`}
                          >
                            {user.banned ? "Banni" : "Actif"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap text-sm text-slate-400">
                          {user.createdAt.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td>
                          <div className="flex min-w-64 flex-col gap-3">
                            <form
                              action={updateUserRole}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <label
                                htmlFor={`role-${user.id}`}
                                className="sr-only"
                              >
                                Rôle de {user.name || user.email}
                              </label>
                              <select
                                id={`role-${user.id}`}
                                name="role"
                                defaultValue={user.role}
                                className="select select-bordered select-sm min-w-0 flex-1 border-white/10 bg-[#080b14] text-white"
                              >
                                <option value="USER">Membre</option>
                                <option value="EDITOR">Éditeur</option>
                                <option value="ADMIN">Administrateur</option>
                              </select>
                              <button
                                type="submit"
                                className="btn btn-sm btn-outline border-white/20"
                              >
                                Enregistrer
                              </button>
                            </form>

                            <form action={toggleUserBan}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <button
                                type="submit"
                                disabled={
                                  user.role === "ADMIN" &&
                                  !user.banned &&
                                  activeAdmins <= 1
                                }
                                className={`btn btn-sm w-full ${
                                  user.banned
                                    ? "btn-success"
                                    : "btn-outline border-red-500/40 text-red-300 hover:bg-red-500/10"
                                }`}
                              >
                                {user.banned
                                  ? "Réactiver le compte"
                                  : "Bannir le compte"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <footer className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
          CineWave · Administration des utilisateurs
        </footer>
      </div>
    </main>
  );
}
