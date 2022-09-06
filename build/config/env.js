"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.Env = {
    NODE_ENV: process.env.NODE_ENV === "production" ? "production" : "development",
    NAME: "Guardians",
    PORT: Number(process.env.CANDIDE_GUARDIAN_PORT),
    MONGO_URL: process.env.CANDIDE_GUARDIAN_MONGODB_URL ?? "",
    ALCHEMY_GOERLI_RPC: process.env.CANDIDE_GUARDIAN_ALCHEMY_GOERLI_RPC ?? "",
    BUNDLER_URL: process.env.CANDIDE_GUARDIAN_BUNDLER_URL ?? "",
    SENTRY_DSN: process.env.CANDIDE_GUARDIAN_SENTRY_DSN ?? "",
};
