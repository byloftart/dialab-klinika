import { Storage } from "@google-cloud/storage";
import { ENV } from "./_core/env";

type LegacyStorageConfig = { baseUrl: string; apiKey: string };

let gcsStorage: Storage | null = null;

function hasGcsConfig() {
  return Boolean(ENV.gcsBucketName);
}

function getGcsStorage() {
  if (!gcsStorage) {
    gcsStorage = new Storage();
  }
  return gcsStorage;
}

function getLegacyStorageConfig(): LegacyStorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage is not configured: set GCS_BUCKET_NAME or BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function buildGcsPublicUrl(key: string) {
  if (!ENV.gcsBucketName) {
    throw new Error("GCS_BUCKET_NAME is not configured");
  }

  if (ENV.gcsPublicBaseUrl) {
    return `${ENV.gcsPublicBaseUrl.replace(/\/+$/, "")}/${key}`;
  }

  return `https://storage.googleapis.com/${ENV.gcsBucketName}/${key}`;
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (hasGcsConfig()) {
    const bucket = getGcsStorage().bucket(ENV.gcsBucketName);
    const file = bucket.file(key);
    const buffer = Buffer.isBuffer(data)
      ? data
      : typeof data === "string"
        ? Buffer.from(data)
        : Buffer.from(data);

    await file.save(buffer, {
      metadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      resumable: false,
      validation: false,
    });

    return {
      key,
      url: buildGcsPublicUrl(key),
    };
  }

  const { baseUrl, apiKey } = getLegacyStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }

  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (hasGcsConfig()) {
    return { key, url: buildGcsPublicUrl(key) };
  }

  const { baseUrl, apiKey } = getLegacyStorageConfig();
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
