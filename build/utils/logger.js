"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestErrorLogger = exports.httpRequestSuccessLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_transport_sentry_node_1 = __importDefault(require("winston-transport-sentry-node"));
const isURL_1 = __importDefault(require("validator/lib/isURL"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("../config");
const enumerateErrorFormat = winston_1.default.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
const baseTransport = [
    new winston_1.default.transports.Console({
        stderrLevels: ["error"],
    }),
];
exports.logger = winston_1.default.createLogger({
    level: config_1.Env.NODE_ENV === "development" ? "debug" : "info",
    format: winston_1.default.format.combine(enumerateErrorFormat(), config_1.Env.NODE_ENV === "development"
        ? winston_1.default.format.colorize()
        : winston_1.default.format.uncolorize(), winston_1.default.format.splat(), winston_1.default.format.printf(({ level, message }) => `[${config_1.Env.NAME}] ${level}: ${message}`)),
    transports: (0, isURL_1.default)(config_1.Env.SENTRY_DSN)
        ? [
            ...baseTransport,
            new winston_transport_sentry_node_1.default({
                sentry: {
                    dsn: config_1.Env.SENTRY_DSN,
                },
                level: "error",
            }),
        ]
        : baseTransport,
});
morgan_1.default.token("message", (_req, res) => res.locals.errorMessage || "");
const getIpFormat = () => config_1.Env.NODE_ENV === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;
exports.httpRequestSuccessLogger = (0, morgan_1.default)(successResponseFormat, {
    skip: (_req, res) => res.statusCode >= 400,
    stream: { write: (message) => exports.logger.info(message.trim()) },
});
exports.httpRequestErrorLogger = (0, morgan_1.default)(errorResponseFormat, {
    skip: (_req, res) => res.statusCode < 400,
    stream: { write: (message) => exports.logger.error(message.trim()) },
});
