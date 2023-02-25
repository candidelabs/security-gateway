import dotenv from "dotenv";

dotenv.config();

interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NAME: string;
  PORT: number;
  GOERLI_RPC: string;
  OPTIMISM_GOERLI_RPC: string;
  OPTIMISM_RPC: string;
  FINALIZER_SK: string;
  MONGO_URL: string;
  SENTRY_DSN: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NAME: "Security Gateway",
  PORT: Number(process.env.CANDIDE_SECURITY_PORT),
  MONGO_URL: process.env.CANDIDE_SECURITY_MONGODB_URL ?? "",
  GOERLI_RPC: process.env.CANDIDE_SECURITY_GOERLI_RPC ?? "",
  OPTIMISM_GOERLI_RPC: process.env.CANDIDE_SECURITY_OPTIMISM_GOERLI_RPC ?? "",
  OPTIMISM_RPC: process.env.CANDIDE_SECURITY_OPTIMISM_RPC ?? "",
  FINALIZER_SK: process.env.CANDIDE_SECURITY_FINALIZER_SK ?? "",
  SENTRY_DSN: process.env.CANDIDE_SECURITY_SENTRY_DSN ?? "",
};
