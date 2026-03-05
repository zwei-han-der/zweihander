import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const SCHEMA_VERSION = "1.0.0";
const APP_BASE_PATH = "/zweihander";
const NORMALIZE_BASE = "https://example.local";
const OUTPUT_RELATIVE_PATH = "public/metadata.json";
const FETCH_TIMEOUT_MS = 8000;
const FETCH_CONCURRENCY = 5;

const SOURCE_TARGETS = [
  {
    type: "markdown",
    dir: "src/data/blog",
    extension: ".md",
  },
  {
    type: "markdown",
    dir: "src/data/changelog",
    extension: ".md",
  },
  {
    type: "jsx",
    file: "src/pages/Bookmarks.jsx",
  },
];

const UNSUPPORTED_SCHEME_PATTERN = /^(mailto|tel|javascript):/i;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function cleanMarkdownUrl(rawValue) {
  if (!rawValue) {
    return "";
  }

  let cleaned = rawValue.trim();

  if ((cleaned.startsWith("<") && cleaned.endsWith(">")) || (cleaned.startsWith("(") && cleaned.endsWith(")"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

function normalizeUrl(rawInput) {
  const original = String(rawInput ?? "");
  const trimmed = original.trim();

  if (!trimmed) {
    return {
      valid: false,
      classification: "unsupported",
      status: "skipped",
      skipReason: "invalid_url",
      normalizedUrl: null,
      sanitizedRawUrl: trimmed,
    };
  }

  if (trimmed.startsWith("#")) {
    return {
      valid: false,
      classification: "unsupported",
      status: "skipped",
      skipReason: "hash_only",
      normalizedUrl: null,
      sanitizedRawUrl: trimmed,
    };
  }

  if (UNSUPPORTED_SCHEME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      classification: "unsupported",
      status: "skipped",
      skipReason: "unsupported_scheme",
      normalizedUrl: null,
      sanitizedRawUrl: trimmed,
    };
  }

  let candidate = trimmed;
  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  }

  const isClearlyInternal =
    candidate.startsWith("/") || candidate.startsWith("./") || candidate.startsWith("../");

  try {
    const parsed = new URL(candidate, NORMALIZE_BASE);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        valid: false,
        classification: "unsupported",
        status: "skipped",
        skipReason: "unsupported_scheme",
        normalizedUrl: null,
        sanitizedRawUrl: trimmed,
      };
    }

    parsed.hostname = parsed.hostname.toLowerCase();

    if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
      parsed.port = "";
    }

    if (!parsed.pathname) {
      parsed.pathname = "/";
    }

    let classification = "external_http";
    if (isClearlyInternal || parsed.hostname === "example.local") {
      classification = "internal_app";
    }

    if (parsed.pathname === "/" + APP_BASE_PATH.replace(/^\//, "")) {
      classification = "internal_app";
    }

    return {
      valid: true,
      classification,
      status: classification === "external_http" ? "pending" : "skipped",
      skipReason: classification === "external_http" ? null : "internal_link",
      normalizedUrl: parsed.toString(),
      sanitizedRawUrl: trimmed,
    };
  } catch {
    return {
      valid: false,
      classification: "unsupported",
      status: "skipped",
      skipReason: "invalid_url",
      normalizedUrl: null,
      sanitizedRawUrl: trimmed,
    };
  }
}

function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, "");
}

function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, "");
}

function extractMarkdownUrls(content, filePath) {
  const refs = [];
  const preparedContent = stripFencedCodeBlocks(content);
  const lines = preparedContent.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const cleanLine = stripInlineCode(line);

    const inlineLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    for (const match of cleanLine.matchAll(inlineLinkPattern)) {
      refs.push({
        url: cleanMarkdownUrl(match[2]),
        sourceRef: {
          file: filePath,
          line: lineNumber,
          kind: "markdown_inline",
          label: match[1].trim() || null,
        },
      });
    }

    const autoLinkPattern = /<((?:https?:\/\/|\/\/)[^>\s]+)>/g;
    for (const match of cleanLine.matchAll(autoLinkPattern)) {
      refs.push({
        url: cleanMarkdownUrl(match[1]),
        sourceRef: {
          file: filePath,
          line: lineNumber,
          kind: "markdown_autolink",
          label: null,
        },
      });
    }

    const plainUrlPattern = /(?:^|\s)(https?:\/\/[^\s<>"]+)/g;
    for (const match of cleanLine.matchAll(plainUrlPattern)) {
      const url = (match[1] || "").trim();
      if (!url) {
        continue;
      }

      refs.push({
        url,
        sourceRef: {
          file: filePath,
          line: lineNumber,
          kind: "markdown_plain_url",
          label: null,
        },
      });
    }
  });

  return refs;
}

function extractJsxUrls(content, filePath) {
  const refs = [];
  const anchorTagPattern = /<a\b[\s\S]*?>/g;
  const hrefPattern = /href\s*=\s*["']([^"']+)["']/i;

  for (const anchorMatch of content.matchAll(anchorTagPattern)) {
    const anchorTag = anchorMatch[0];
    const hrefMatch = anchorTag.match(hrefPattern);
    if (!hrefMatch?.[1]) {
      continue;
    }

    const startIndex = anchorMatch.index ?? 0;
    const lineNumber = content.slice(0, startIndex).split(/\r?\n/).length;

    refs.push({
      url: hrefMatch[1].trim(),
      sourceRef: {
        file: filePath,
        line: lineNumber,
        kind: "jsx_href",
        label: null,
      },
    });
  }

  return refs;
}

async function getFilesRecursive(dirPath, extension) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await getFilesRecursive(fullPath, extension);
      results.push(...nested);
    } else if (entry.isFile() && fullPath.endsWith(extension)) {
      results.push(fullPath);
    }
  }

  return results;
}

function dedupeSourceRefs(sourceRefs) {
  const seen = new Set();
  const deduped = [];

  for (const ref of sourceRefs) {
    const key = `${ref.file}:${ref.line}:${ref.kind}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(ref);
  }

  return deduped;
}

function decodeHtmlEntities(value) {
  if (!value) {
    return null;
  }

  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim() || null;
}

function getMetaTagContent(html, descriptors) {
  for (const descriptor of descriptors) {
    const escaped = descriptor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
      "i",
    );

    const match = html.match(regex);
    if (match) {
      return decodeHtmlEntities(match[1] || match[2] || null);
    }
  }

  return null;
}

function getTitleFromHtml(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtmlEntities(titleMatch?.[1] ?? null);
}

function getFaviconFromHtml(html, finalUrl) {
  const faviconMatch = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  if (!faviconMatch?.[1]) {
    return null;
  }

  try {
    return new URL(faviconMatch[1], finalUrl).toString();
  } catch {
    return null;
  }
}

function resolveMaybeRelativeUrl(rawUrl, baseUrl) {
  if (!rawUrl) {
    return null;
  }

  try {
    return new URL(rawUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

async function fetchLinkMetadata(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "ZweihanderLinkMetadataBot/1.0 (+build)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    const httpStatus = response.status;
    const finalUrl = response.url || url;

    if (!response.ok) {
      return {
        status: "failed",
        httpStatus,
        finalUrl,
        fetchedAt: new Date().toISOString(),
        error: {
          code: "http_error",
          message: `HTTP status ${httpStatus}`,
        },
      };
    }

    const html = await response.text();

    const title =
      getMetaTagContent(html, ["og:title", "twitter:title"]) ||
      getTitleFromHtml(html);
    const description = getMetaTagContent(html, [
      "og:description",
      "twitter:description",
      "description",
    ]);
    const image = resolveMaybeRelativeUrl(
      getMetaTagContent(html, ["og:image", "twitter:image"]),
      finalUrl,
    );
    const siteName =
      getMetaTagContent(html, ["og:site_name", "twitter:site"]) ||
      (() => {
        try {
          return new URL(finalUrl).hostname;
        } catch {
          return null;
        }
      })();
    const favicon = getFaviconFromHtml(html, finalUrl);

    return {
      status: "ok",
      title,
      description,
      image,
      siteName,
      favicon,
      httpStatus,
      finalUrl,
      fetchedAt: new Date().toISOString(),
      error: null,
    };
  } catch (error) {
    const isTimeout = error?.name === "AbortError";

    return {
      status: "failed",
      httpStatus: null,
      finalUrl: null,
      fetchedAt: new Date().toISOString(),
      error: {
        code: isTimeout ? "timeout" : "network_error",
        message: isTimeout ? "Request timed out" : String(error?.message || "Unknown network error"),
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runWithConcurrency(items, limit, task) {
  const queue = [...items];
  const workers = [];

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) {
        return;
      }

      await task(item);
    }
  };

  const workerCount = Math.min(limit, queue.length || 1);
  for (let index = 0; index < workerCount; index += 1) {
    workers.push(worker());
  }

  await Promise.all(workers);
}

function createInitialRecord(discovery, normalized) {
  const normalizedUrl = normalized.normalizedUrl ?? `unsupported:${normalized.sanitizedRawUrl}`;

  return {
    url: normalized.sanitizedRawUrl,
    normalizedUrl,
    classification: normalized.classification,
    status: normalized.status === "pending" ? "failed" : normalized.status,
    skipReason: normalized.skipReason,
    title: null,
    description: null,
    image: null,
    siteName: null,
    favicon: null,
    finalUrl: null,
    httpStatus: null,
    fetchedAt: null,
    error:
      normalized.status === "pending"
        ? null
        : {
            code:
              normalized.skipReason === "invalid_url"
                ? "invalid_url"
                : "unsupported_url",
            message: normalized.skipReason,
          },
    sourceRefs: [discovery.sourceRef],
  };
}

function createSummary(links, startedAtMs) {
  const summary = {
    totalDiscovered: links.reduce((acc, link) => acc + link.sourceRefs.length, 0),
    uniqueUrls: links.length,
    ok: 0,
    failed: 0,
    skipped: 0,
    durationMs: Math.round(performance.now() - startedAtMs),
  };

  for (const link of links) {
    if (link.status === "ok") {
      summary.ok += 1;
    } else if (link.status === "skipped") {
      summary.skipped += 1;
    } else {
      summary.failed += 1;
    }
  }

  return summary;
}

async function writeMetadataFile(outputPath, payload) {
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const tempPath = `${outputPath}.tmp`;
  const json = `${JSON.stringify(payload, null, 2)}\n`;

  await fs.writeFile(tempPath, json, "utf8");
  await fs.rename(tempPath, outputPath);
}

async function discoverLinks() {
  const discoveries = [];

  for (const target of SOURCE_TARGETS) {
    if (target.type === "markdown") {
      const absoluteDir = path.join(projectRoot, target.dir);
      const files = await getFilesRecursive(absoluteDir, target.extension);

      for (const absoluteFilePath of files) {
        const content = await fs.readFile(absoluteFilePath, "utf8");
        const relativeFilePath = path.relative(projectRoot, absoluteFilePath).replace(/\\/g, "/");
        discoveries.push(...extractMarkdownUrls(content, relativeFilePath));
      }
    }

    if (target.type === "jsx") {
      const absoluteFilePath = path.join(projectRoot, target.file);
      const content = await fs.readFile(absoluteFilePath, "utf8");
      const relativeFilePath = path.relative(projectRoot, absoluteFilePath).replace(/\\/g, "/");
      discoveries.push(...extractJsxUrls(content, relativeFilePath));
    }
  }

  return discoveries;
}

async function main() {
  const startedAt = performance.now();
  const discoveries = await discoverLinks();
  const recordsByKey = new Map();

  for (const discovery of discoveries) {
    const normalized = normalizeUrl(discovery.url);
    const key = normalized.normalizedUrl ?? `unsupported:${normalized.sanitizedRawUrl}`;

    if (!recordsByKey.has(key)) {
      recordsByKey.set(key, createInitialRecord(discovery, normalized));
      continue;
    }

    const existing = recordsByKey.get(key);
    existing.sourceRefs.push(discovery.sourceRef);
  }

  const records = [...recordsByKey.values()]
    .map((record) => ({
      ...record,
      sourceRefs: dedupeSourceRefs(record.sourceRefs),
    }))
    .sort((a, b) => a.normalizedUrl.localeCompare(b.normalizedUrl));

  const externalTargets = records.filter(
    (record) => record.classification === "external_http",
  );

  await runWithConcurrency(externalTargets, FETCH_CONCURRENCY, async (record) => {
    const metadata = await fetchLinkMetadata(record.normalizedUrl);
    record.status = metadata.status;
    record.title = metadata.title ?? null;
    record.description = metadata.description ?? null;
    record.image = metadata.image ?? null;
    record.siteName = metadata.siteName ?? null;
    record.favicon = metadata.favicon ?? null;
    record.finalUrl = metadata.finalUrl ?? null;
    record.httpStatus = metadata.httpStatus ?? null;
    record.fetchedAt = metadata.fetchedAt ?? null;
    record.error = metadata.error ?? null;
    record.skipReason = null;
  });

  const output = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    summary: createSummary(records, startedAt),
    links: records,
  };

  const outputPath = path.join(projectRoot, OUTPUT_RELATIVE_PATH);
  await writeMetadataFile(outputPath, output);

  const summary = output.summary;
  console.log(
    `[link-metadata] done: discovered=${summary.totalDiscovered} unique=${summary.uniqueUrls} ok=${summary.ok} failed=${summary.failed} skipped=${summary.skipped} duration=${summary.durationMs}ms`,
  );
}

main().catch((error) => {
  console.error("[link-metadata] fatal:", error);
  process.exitCode = 1;
});
