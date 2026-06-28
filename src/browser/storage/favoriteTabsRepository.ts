import { STORAGE_KEYS } from "../../constants/storageKeys";

/**
 * Tab favorites are persisted by URL, not tab id: Chrome assigns new tab ids
 * every session, but a "favorite tab" is really a favorite page the user wants
 * quick access to. Stored as a list of URLs in chrome.storage.local.
 */

export async function getFavoriteTabUrls(): Promise<string[]> {
  const result = await chrome.storage.local.get(
    STORAGE_KEYS.FAVORITE_TABS
  );

  const urls = result[STORAGE_KEYS.FAVORITE_TABS] as
    | string[]
    | undefined;

  return urls ?? [];
}

async function setFavoriteTabUrls(
  urls: string[]
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.FAVORITE_TABS]: urls,
  });
}

/** Toggle a URL's favorite state; returns the updated list. */
export async function toggleFavoriteTab(
  url: string
): Promise<string[]> {
  if (!url) {
    return getFavoriteTabUrls();
  }

  const urls = await getFavoriteTabUrls();

  const next = urls.includes(url)
    ? urls.filter((item) => item !== url)
    : [...urls, url];

  await setFavoriteTabUrls(next);

  return next;
}
