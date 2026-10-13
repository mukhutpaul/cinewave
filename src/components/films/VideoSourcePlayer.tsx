
"use client";

import { useEffect, useState } from "react";

type VideoSource = {
  id: string;
  label: string;
  url: string;
  provider: "OWN_HOSTING" | "EXTERNAL";
  isPrimary: boolean;
  sortOrder: number;
};

type Props = {
  sources: VideoSource[];
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    let videoId: string | null = null;

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(hostname)
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else {
        const match = parsed.pathname.match(
          /^\/(?:embed|shorts|live)\/([\w-]{11})/,
        );

        videoId = match?.[1] ?? null;
      }
    }

    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function isDirectVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      /\.(mp4|webm|ogg|m4v|mov)$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export default function VideoSourcePlayer({ sources }: Props) {
  const orderedSources = [...sources].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }

    return a.sortOrder - b.sortOrder;
  });

  const [selectedId, setSelectedId] = useState(
    orderedSources[0]?.id ?? "",
  );

  // Si la liste des sources change, conserver la sélection si possible.
  useEffect(() => {
    if (!orderedSources.length) {
      setSelectedId("");
      return;
    }

    setSelectedId((currentId) =>
      orderedSources.some((source) => source.id === currentId)
        ? currentId
        : orderedSources[0].id,
    );
  }, [sources]);

  const selectedSource =
    orderedSources.find((source) => source.id === selectedId) ??
    orderedSources[0];

  if (!selectedSource) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-8 text-center text-slate-400">
        Aucune source vidéo disponible pour le moment.
      </div>
    );
  }

  const youtubeUrl = getYouTubeEmbedUrl(selectedSource.url);

  // Une URL YouTube est reconnue par son domaine, même si provider
  // est incorrectement renseigné dans la base de données.
  const isYouTube = youtubeUrl !== null;
  const isDirectVideo = isDirectVideoUrl(selectedSource.url);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      {orderedSources.length > 1 && (
        <div className="flex flex-col gap-2 border-b border-white/10 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="video-source"
            className="text-sm font-semibold text-slate-200"
          >
            Choisir une source vidéo
          </label>

          <select
            id="video-source"
            value={selectedSource.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className="select select-bordered w-full border-white/15 bg-[#080b14] text-white sm:max-w-sm"
          >
            {orderedSources.map((source, index) => (
              <option key={source.id} value={source.id}>
                {source.label || `Source ${index + 1}`}
                {source.isPrimary ? " (principale)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative aspect-video w-full bg-black">
        {isYouTube ? (
          <iframe
            key={selectedSource.id}
            src={youtubeUrl}
            title={selectedSource.label || "Vidéo YouTube Histyra"}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : isDirectVideo ? (
          <video
            key={selectedSource.id}
            className="absolute inset-0 h-full w-full"
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            aria-label={selectedSource.label || "Lecteur vidéo Histyra"}
          >
            <source src={selectedSource.url} />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm font-semibold text-white">
              Format vidéo non pris en charge
            </p>
            <p className="max-w-md text-sm text-slate-400">
              Utilisez un lien YouTube valide ou une URL directe vers un
              fichier vidéo compatible, comme un fichier MP4 public.
            </p>
            <a
              href={selectedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-400 underline underline-offset-4 hover:text-sky-300"
            >
              Ouvrir la source dans un nouvel onglet
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-400">
        <span>
          Source : {selectedSource.label || "Source vidéo"}
        </span>

        <span>
          {isYouTube
            ? "YouTube"
            : selectedSource.provider === "OWN_HOSTING"
              ? "Hébergement Histyra"
              : "Source externe"}
        </span>
      </div>
    </div>
  );
}
