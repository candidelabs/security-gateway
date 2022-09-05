import dotenv from "dotenv";

dotenv.config();

interface AppEnvironment {
  NODE_ENV: "production" | "development";
  NAME: string;
  PORT: number;
  ALCHEMY_GOERLI_RPC: string;
  BUNDLER_URL: string;
  MONGO_URL: string;
  SENTRY_DSN: string;
}

export const Env: AppEnvironment = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ? "production" : "development",
  NAME: "Guardians",
  PORT: Number(process.env.CANDIDE_SECURITY_PORT),
  MONGO_URL: process.env.CANDIDE_SECURITY_MONGODB_URL ?? "",
  ALCHEMY_GOERLI_RPC: process.env.CANDIDE_SECURITY_ALCHEMY_GOERLI_RPC ?? "",
  BUNDLER_URL: process.env.CANDIDE_SECURITY_BUNDLER_URL ?? "",
  SENTRY_DSN: process.env.CANDIDE_SECURITY_SENTRY_DSN ?? "",
};
