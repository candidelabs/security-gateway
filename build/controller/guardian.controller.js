"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchById = exports.fetchByAddress = exports.sign = exports.submit = exports.post = void 0;
const http_status_1 = __importDefault(require("http-status"));
const utils_1 = require("../utils");
const GuardianService = __importStar(require("../services/guardian.service"));
exports.post = (0, utils_1.catchAsync)(async (req, res) => {
    const params = req.body;
    const response = await GuardianService.create(params.walletAddress, params.socialRecoveryAddress, params.oldOwner, params.newOwner, params.dataHash, params.network);
    res.send(response);
});
exports.submit = (0, utils_1.catchAsync)(async (req, res) => {
    const { id, transactionHash } = req.body;
    await GuardianService.submit(id, transactionHash);
    res.send({ success: true });
});
exports.sign = (0, utils_1.catchAsync)(async (req, res) => {
    const { id, signedMessage } = req.body;
    await GuardianService.signDataHash(id, signedMessage);
    res.send({ success: true });
});
exports.fetchByAddress = (0, utils_1.catchAsync)(async (req, res) => {
    const { walletAddress, network } = req.query;
    const walletRequests = await GuardianService.findByWalletAddress(walletAddress, network);
    const responses = [];
    for (const request of walletRequests) {
        const requestJSON = await (request.toJSON());
        const object = { ...requestJSON, signaturesAcquired: requestJSON.signatures.length };
        responses.push(object);
    }
    res.send(responses);
});
exports.fetchById = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.query;
    const request = await GuardianService.findById(id);
    if (request == null) {
        throw new utils_1.ApiError(http_status_1.default.NOT_FOUND, `Recovery request not found`);
    }
    const requestJSON = await (request.toJSON());
    const object = { ...requestJSON, signaturesAcquired: requestJSON.signatures.length };
    res.send(object);
});
