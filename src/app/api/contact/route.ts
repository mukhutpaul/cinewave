
import { NextResponse } from "next/server";
import { Resend } from "resend";

const allowedSubjects = [
  "Question générale",
  "Suggestion",
  "Partenariat",
  "Problème technique",
  "Autre demande",
] as const;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (char) => entities[char]);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    const emailFrom = process.env.EMAIL_FROM;

    if (!apiKey || !contactEmail || !emailFrom) {
      console.error(
        "Contact API: missing server environment variables.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Le service de contact est momentanément indisponible.",
        },
        { status: 503 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: "Format de requête invalide.",
        },
        { status: 415 },
      );
    }

    // Évite de traiter des corps de requête excessivement volumineux.
    const contentLength = Number(
      request.headers.get("content-length") ?? "0",
    );

    if (contentLength > 20_000) {
      return NextResponse.json(
        {
          success: false,
          error: "La requête est trop volumineuse.",
        },
        { status: 413 },
      );
    }

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides.",
        },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;
    const { name, email, subject, message, website } = data;

    // Champ piège anti-spam : il doit rester vide.
    if (isString(website) && website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    if (
      !isString(name) ||
      !isString(email) ||
      !isString(subject) ||
      !isString(message)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Merci de remplir tous les champs.",
        },
        { status: 400 },
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le nom doit contenir entre 2 et 100 caractères.",
        },
        { status: 400 },
      );
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "L'adresse e-mail n'est pas valide.",
        },
        { status: 400 },
      );
    }

    if (
      !allowedSubjects.includes(
        cleanSubject as (typeof allowedSubjects)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Choisis un sujet valide.",
        },
        { status: 400 },
      );
    }

    if (
      cleanMessage.length < 10 ||
      cleanMessage.length > 5000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le message doit contenir entre 10 et 5 000 caractères.",
        },
        { status: 400 },
      );
    }

    // Initialise Resend uniquement après vérification de la configuration.
    const resend = new Resend(apiKey);

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage).replace(
      /\r?\n/g,
      "<br />",
    );

    const { data: sent, error } = await resend.emails.send({
      from: emailFrom,
      to: [contactEmail],
      replyTo: cleanEmail,
      subject: `[HISTYRA Contact] ${cleanSubject}`,
      text: [
        "Nouveau message depuis le formulaire de contact HISTYRA",
        "",
        `Nom : ${cleanName}`,
        `E-mail : ${cleanEmail}`,
        `Sujet : ${cleanSubject}`,
        "",
        "Message :",
        cleanMessage,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.7">
          <h2>Nouveau message — HISTYRA</h2>
          <p><strong>Nom :</strong> ${safeName}</p>
          <p><strong>E-mail :</strong> ${safeEmail}</p>
          <p><strong>Sujet :</strong> ${safeSubject}</p>
          <hr />
          <h3>Message</h3>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend contact error:", error);

      return NextResponse.json(
        {
          success: false,
          error:
            "L'envoi a échoué. Réessaie un peu plus tard.",
        },
        { status: 502 },
      );
    }

    if (!sent?.id) {
      console.error(
        "Contact email returned no message ID.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Nous n'avons pas pu confirmer l'envoi. Réessaie plus tard.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Une erreur est survenue. Réessaie plus tard.",
      },
      { status: 500 },
    );
  }
}
