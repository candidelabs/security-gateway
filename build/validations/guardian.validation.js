"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.sign = exports.post = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("./custom.validation");
exports.post = {
    body: joi_1.default.object().keys({
        walletAddress: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        newOwner: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        network: joi_1.default.string().required(),
    }),
};
exports.sign = {
    body: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
        signedMessage: joi_1.default.string().required(),
    }),
};
exports.fetch = {
    query: joi_1.default.object().keys({
        walletAddress: joi_1.default.custom(custom_validation_1.ethereumAddress).required(),
    }),
};
