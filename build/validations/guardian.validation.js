"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchById = exports.fetchByAddress = exports.sign = exports.submit = exports.post = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("./custom.validation");
const config_1 = require("../config");
exports.post = {
    body: joi_1.default.object().keys({
        walletAddress: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        socialRecoveryAddress: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        dataHash: joi_1.default.string().required(),
        oldOwner: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        newOwner: joi_1.default.required().custom(custom_validation_1.ethereumAddress),
        network: joi_1.default.string().valid(...config_1.ValidNetworks).required(),
    }),
};
exports.submit = {
    body: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
        transactionHash: joi_1.default.string().required(),
    }),
};
exports.sign = {
    body: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
        signedMessage: joi_1.default.string().required(),
    }),
};
exports.fetchByAddress = {
    query: joi_1.default.object().keys({
        walletAddress: joi_1.default.custom(custom_validation_1.ethereumAddress).required(),
        network: joi_1.default.string().valid(...config_1.ValidNetworks).required(),
    }),
};
exports.fetchById = {
    query: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
    }),
};
