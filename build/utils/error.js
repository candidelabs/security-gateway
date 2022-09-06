"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
exports.catchAsync = catchAsync;
