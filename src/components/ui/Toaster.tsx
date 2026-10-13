"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
      visibleToasts={4}
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl",
          title: "font-semibold",
          description: "text-sm opacity-90",
        },
      }}
    />
  );
}