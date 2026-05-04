import "dotenv/config";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  gcsBucketName: process.env.GCS_BUCKET_NAME ?? "",
  gcsPublicBaseUrl: process.env.GCS_PUBLIC_BASE_URL ?? "",
  botpressClientId: process.env.BOTPRESS_WEBCHAT_CLIENT_ID ?? "",
  botpressApiUrl: process.env.BOTPRESS_WEBCHAT_API_URL ?? "",
  botpressStylesheetUrl: process.env.BOTPRESS_WEBCHAT_STYLESHEET_URL ?? "",
  assistantProvider: process.env.ASSISTANT_PROVIDER ?? "",
  hermesApiBaseUrl: process.env.HERMES_API_BASE_URL ?? "",
  hermesApiKey: process.env.HERMES_API_KEY ?? "",
  hermesModel: process.env.HERMES_MODEL ?? "deepseek-v4-flash",
};
