
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "./seed-client";

async function main() {
  const name = process.env.SUPERADMIN_NAME?.trim();
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Configurez SUPERADMIN_NAME, SUPERADMIN_EMAIL et SUPERADMIN_PASSWORD."
    );
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error(
      "Le mot de passe doit contenir entre 12 et 128 caractères."
    );
  }

  console.log("Initialisation du superadministrateur...");

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          id: randomUUID(),
          name,
          email,
          emailVerified: true,
          role: "ADMIN",
          banned: false,
        },
      });
      console.log("Utilisateur administrateur créé.");
    } else {
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          name,
          role: "ADMIN",
          emailVerified: true,
          banned: false,
        },
      });
      console.log("Utilisateur existant mis à jour.");
    }

    const account = await tx.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (account) {
      await tx.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
        },
      });
      console.log("Mot de passe du compte credential réinitialisé.");
    } else {
      await tx.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      });
      console.log("Compte credential créé.");
    }

    console.log(`Administrateur : ${user.email}`);
    console.log(`Rôle : ${user.role}`);
  });

  console.log("Initialisation terminée.");
}

main()
  .catch((error) => {
    console.error("Échec du seed administrateur :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
