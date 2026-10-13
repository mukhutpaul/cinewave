
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/mp4"]);
const URL_EXPIRATION_SECONDS = 600;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Configuration R2 incomplète : vérifiez R2_ACCOUNT_ID, R2_ACCESS_KEY_ID et R2_SECRET_ACCESS_KEY.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session Better Auth.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return jsonError("Vous devez être connecté.", 401);
    }

    // 2. Vérifier le rôle et l'état du compte.
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        banned: true,
      },
    });

    if (!user || user.banned) {
      return jsonError(
        "Compte introuvable ou désactivé.",
        403,
      );
    }

    if (user.role !== "ADMIN") {
      return jsonError(
        "Accès réservé aux administrateurs.",
        403,
      );
    }

    // 3. Vérifier le type de contenu de la requête.
    const requestContentType =
      request.headers.get("content-type") ?? "";

    if (!requestContentType.includes("application/json")) {
      return jsonError(
        "La requête doit être envoyée au format JSON.",
        415,
      );
    }

    // 4. Lire et valider les données.
    const body: unknown = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError("Données invalides.", 400);
    }

    const data = body as Record<string, unknown>;
    const { fileName, contentType, fileSize } = data;

    if (
      typeof fileName !== "string" ||
      !fileName.trim() ||
      fileName.length > 255
    ) {
      return jsonError("Nom de fichier invalide.", 400);
    }

    if (
      typeof contentType !== "string" ||
      !ALLOWED_TYPES.has(contentType.toLowerCase())
    ) {
      return jsonError(
        "Seuls les fichiers MP4 sont autorisés.",
        400,
      );
    }

    if (
      typeof fileSize !== "number" ||
      !Number.isSafeInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_FILE_SIZE
    ) {
      return jsonError(
        "Le fichier doit avoir une taille comprise entre 1 octet et 500 Mo.",
        400,
      );
    }

    if (!fileName.trim().toLowerCase().endsWith(".mp4")) {
      return jsonError(
        "Le nom du fichier doit se terminer par .mp4.",
        400,
      );
    }

    // 5. Vérifier la configuration publique R2.
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(
      /\/+$/,
      "",
    );

    if (!bucketName || !publicUrl) {
      console.error(
        "Configuration manquante : R2_BUCKET_NAME ou R2_PUBLIC_URL.",
      );

      return jsonError(
        "La configuration du stockage vidéo est incomplète.",
        500,
      );
    }

    let parsedPublicUrl: URL;

    try {
      parsedPublicUrl = new URL(publicUrl);
    } catch {
      return jsonError(
        "R2_PUBLIC_URL doit être une URL valide.",
        500,
      );
    }

    if (
      !["https:", "http:"].includes(parsedPublicUrl.protocol) ||
      parsedPublicUrl.username ||
      parsedPublicUrl.password ||
      parsedPublicUrl.search ||
      parsedPublicUrl.hash
    ) {
      return jsonError(
        "R2_PUBLIC_URL doit être une URL HTTP(S) valide, sans identifiants ni paramètres.",
        500,
      );
    }

    // 6. Générer une clé unique et une URL signée.
    const key = `movies/${randomUUID()}.mp4`;
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "video/mp4",
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    // 7. Retourner une réponse JSON.
    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        key,
        publicUrl: `${publicUrl}/${key}`,
        expiresIn: URL_EXPIRATION_SECONDS,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erreur lors de la préparation de l'upload R2 :",
      error,
    );

    return jsonError(
      "Impossible de préparer l'envoi de la vidéo. Vérifiez la configuration du serveur.",
      500,
    );
  }
}