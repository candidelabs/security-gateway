"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errorConverter = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = require("../config");
const utils_1 = require("../utils");
const errorConverter = (err, _req, _res, next) => {
    let error = err;
    if (!(error instanceof utils_1.ApiError)) {
        const statusCode = error.statusCode ?? http_status_1.default.INTERNAL_SERVER_ERROR;
        const message = error.message || http_status_1.default[statusCode];
        error = new utils_1.ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};
exports.errorConverter = errorConverter;
const errorHandler = (err, _req, res) => {
    let { statusCode, message } = err;
    if (config_1.Env.NODE_ENV === "production" && !err.isOperational) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message = http_status_1.default[http_status_1.default.INTERNAL_SERVER_ERROR];
    }
    res.locals.errorMessage = err.message;
    const response = {
        code: statusCode,
        message,
        ...(config_1.Env.NODE_ENV === "development" && { stack: err.stack }),
    };
    if (config_1.Env.NODE_ENV === "development") {
        utils_1.logger.error(err);
    }
    res.status(statusCode).send(response);
};
exports.errorHandler = errorHandler;
