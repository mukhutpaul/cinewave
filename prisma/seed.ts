
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "./seed-client";

async function main() {
  const name = process.env.SUPERADMIN_NAME?.trim();
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Configurez SUPERADMIN_NAME, SUPERADMIN_EMAIL et SUPERADMIN_PASSWORD dans votre fichier .env."
    );
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error(
      "Le mot de passe doit contenir entre 12 et 128 caractères."
    );
  }

  console.log("Initialisation du compte Superadministrateur...");

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const hashedPassword = await hashPassword(password);

    user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        emailVerified: true,
        role: "ADMIN",
        banned: false,
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: email,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    });

    console.log("Compte Superadministrateur créé.");
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        role: "ADMIN",
        emailVerified: true,
        banned: false,
      },
    });

    console.log("Compte existant promu Superadministrateur.");
    console.log("Son mot de passe n'a pas été modifié.");
  }

  console.log("----------------------------------------");
  console.log("Superadministrateur initialisé avec succès.");
  console.log(`Nom    : ${user.name}`);
  console.log(`E-mail : ${user.email}`);
  console.log(`Rôle   : ${user.role}`);
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error("Échec du seed Superadministrateur :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
