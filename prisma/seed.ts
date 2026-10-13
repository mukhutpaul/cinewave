
import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "@/lib/prisma";



async function main() {
  const name = process.env.SUPERADMIN_NAME?.trim();
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Configurez SUPERADMIN_NAME, SUPERADMIN_EMAIL et SUPERADMIN_PASSWORD dans votre fichier .env."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Le mot de passe du Superadministrateur doit contenir au moins 12 caractères."
    );
  }

  console.log("Initialisation du compte Superadministrateur...");

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Better Auth crée le compte et gère le hachage du mot de passe.
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(
        "Better Auth n'a pas créé le compte. Vérifiez sa configuration."
      );
    }

    console.log("Compte utilisateur créé.");
  } else {
    console.log("Compte existant détecté.");
  }

  // Le rôle est attribué exclusivement côté serveur.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ADMIN",
      emailVerified: true,
      banned: false,
    },
  });

  console.log("----------------------------------------");
  console.log("Superadministrateur initialisé avec succès.");
  console.log(`Nom       : ${name}`);
  console.log(`E-mail    : ${email}`);
  console.log("Rôle      : ADMIN");
  console.log("----------------------------------------");
  console.log("Le mot de passe n'est pas affiché.");
}

main()
  .catch((error) => {
    console.error("Échec du seed Superadministrateur :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
