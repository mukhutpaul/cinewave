"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type ToastFeedbackProps = {
  message?: string;
  erreur?: string;
};

const messages: Record<string, string> = {
  "role-modifie": "Le rôle de l’utilisateur a été mis à jour.",
  "compte-banni": "Le compte a été désactivé.",
  "compte-reactive": "Le compte a été réactivé.",
};

const erreurs: Record<string, string> = {
  "donnees-invalides": "Les données envoyées sont invalides.",
  "modification-propre-compte":
    "Vous ne pouvez pas modifier votre propre rôle ni bannir votre compte.",
  "utilisateur-introuvable": "Cet utilisateur n’existe plus.",
  "dernier-admin":
    "Il faut conserver au moins un administrateur actif.",
};

export function ToastFeedback({
  message,
  erreur,
}: ToastFeedbackProps) {
  useEffect(() => {
    if (message && messages[message]) {
      toast.success(messages[message], {
        id: `admin-success-${message}`,
      });
    }

    if (erreur && erreurs[erreur]) {
      toast.error(erreurs[erreur], {
        id: `admin-error-${erreur}`,
      });
    }
  }, [message, erreur]);

  return null;
}