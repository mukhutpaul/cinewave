
import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Mon profil | Histyra",
  description: "Gérez votre profil Histyra.",
};

function ProfileLoading() {
  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-slate-800" />
        <div className="h-10 w-64 max-w-full rounded bg-slate-800" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-800" />
        <div className="mt-8 h-80 rounded-2xl bg-slate-900" />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-2 text-sm text-rose-400">
            Histyra / Mon compte
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Mon profil
          </h1>

          <p className="mt-2 text-slate-400">
            Gérez vos informations personnelles et votre compte.
          </p>
        </div>

        <ProfileForm
          user={{
            name: session.user.name ?? "",
            email: session.user.email,
            image: session.user.image ?? "",
            role:
              (session.user as { role?: string }).role ?? "USER",
          }}
        />
      </div>
    </main>
  );
}
