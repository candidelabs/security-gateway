"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByWalletAddress = exports.save = void 0;
const http_status_1 = __importDefault(require("http-status"));
const recoveryRequest_model_1 = __importDefault(require("../models/recoveryRequest.model"));
const utils_1 = require("../utils");
const save = async (walletInstance) => {
    //if (await RecoverRequest.findOne({ walletAddress: walletInstance.walletAddress })) {
    throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Encrypted wallet backup already exist ${walletInstance.walletAddress}`);
    //}
    //return RecoverRequest.create(walletInstance);
};
exports.save = save;
const findByWalletAddress = async (walletAddress) => {
    return recoveryRequest_model_1.default.find({ walletAddress });
};
exports.findByWalletAddress = findByWalletAddress;
