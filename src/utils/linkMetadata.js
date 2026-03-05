const METADATA_FILE_NAME = "metadata.json";
const DEFAULT_NORMALIZE_BASE = "https://example.local";

let metadataCache = null;
let metadataByUrlCache = null;
let metadataPromise = null;
let metadataLoadFailed = false;

function getMetadataUrl() {
  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${baseUrl.replace(/\/$/, "")}/${METADATA_FILE_NAME}`;
}

export function normalizeLinkUrl(rawInput) {
  const original = String(rawInput ?? "").trim();
  if (!original) {
    return null;
  }

  if (original.startsWith("#")) {
    return null;
  }

  if (/^(mailto|tel|javascript):/i.test(original)) {
    return null;
  }

  let candidate = original;
  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  }

  try {
    const parsed = new URL(candidate, DEFAULT_NORMALIZE_BASE);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    parsed.hostname = parsed.hostname.toLowerCase();

    if (
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")
    ) {
      parsed.port = "";
    }

    if (!parsed.pathname) {
      parsed.pathname = "/";
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function indexMetadata(metadata) {
  const links = metadata?.links ?? [];
  const index = new Map();

  for (const item of links) {
    if (item?.normalizedUrl) {
      index.set(item.normalizedUrl, item);
    }
  }

  return index;
}

function hasMeaningfulDescription(description) {
  if (typeof description !== "string") {
    return false;
  }

  const normalized = description.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }

  if (/^(\.{3}|…+|[-_]+)$/u.test(normalized)) {
    return false;
  }

  return true;
}

export async function loadLinkMetadata() {
  if (metadataCache && metadataByUrlCache) {
    return { metadata: metadataCache, byUrl: metadataByUrlCache };
  }

  if (metadataLoadFailed) {
    return {
      metadata: { schemaVersion: "1.0.0", summary: {}, links: [] },
      byUrl: new Map(),
    };
  }

  if (!metadataPromise) {
    metadataPromise = fetch(getMetadataUrl())
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load metadata.json (${response.status})`);
        }

        const json = await response.json();
        metadataCache = json;
        metadataByUrlCache = indexMetadata(json);

        return { metadata: metadataCache, byUrl: metadataByUrlCache };
      })
      .catch((error) => {
        metadataLoadFailed = true;
        metadataPromise = null;
        throw error;
      });
  }

  return metadataPromise;
}

export async function getLinkMetadataByHref(href) {
  const normalizedUrl = normalizeLinkUrl(href);
  if (!normalizedUrl) {
    return null;
  }

  const { byUrl } = await loadLinkMetadata();
  const record = byUrl.get(normalizedUrl);
  if (!record || record.status !== "ok") {
    return null;
  }

  // Fallback to plain link when preview lacks a meaningful description.
  if (!hasMeaningfulDescription(record.description)) {
    return null;
  }

  return record;
}
