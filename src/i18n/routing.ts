
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "fr", "en"],
  defaultLocale: "ru",
  localePrefix: "always",
});
