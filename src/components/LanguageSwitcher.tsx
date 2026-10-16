
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

const languages = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLanguage(nextLocale: string) {
    if (nextLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale as "ru" | "fr" | "en",
      });
    });
  }

  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span aria-hidden="true">
        {languages.find((item) => item.code === locale)?.flag ?? "🌐"}
      </span>

      <span className="sr-only">Choisir la langue</span>

      <select
        aria-label="Choisir la langue"
        value={locale}
        disabled={isPending}
        onChange={(event) => changeLanguage(event.target.value)}
        className="max-w-28 cursor-pointer bg-transparent text-sm text-white outline-none"
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
            className="bg-[#101522] text-white"
          >
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
