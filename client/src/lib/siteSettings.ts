type Setting = {
  key: string;
  value: string | null;
};

export type NavItemSetting = {
  id: string;
  label: string;
  href: string;
};

export type HomeSectionSetting = {
  id: string;
  enabled: boolean;
};

export function buildSettingsMap(settings?: Setting[] | null) {
  const map: Record<string, string> = {};
  for (const setting of settings ?? []) {
    if (setting.value != null) {
      map[setting.key] = setting.value;
    }
  }
  return map;
}

export function getSetting(
  settings: Record<string, string>,
  key: string,
  fallback: string
) {
  return settings[key] || fallback;
}

export function parseJsonSetting<T>(
  value: string | undefined,
  fallback: T
): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseNavItems(value: string | undefined, fallback: NavItemSetting[]) {
  const parsed = parseJsonSetting<NavItemSetting[]>(value, fallback);
  return parsed.filter(item => item?.id && item?.label && item?.href);
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

export function getVideoEmbedUrl(url: string) {
  if (!url) return null;
  if (isVideoUrl(url)) return url;

  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]{6,})/i
  );
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function isEmbeddableVideoUrl(url: string) {
  return Boolean(getVideoEmbedUrl(url));
}

export function parseHomeSections(value: string | undefined, fallback: HomeSectionSetting[]) {
  const parsed = parseJsonSetting<HomeSectionSetting[]>(value, fallback);
  return parsed.filter((item) => item?.id && typeof item.enabled === 'boolean');
}
