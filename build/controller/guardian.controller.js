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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchById = exports.fetchByAddress = exports.sign = exports.post = void 0;
const utils_1 = require("../utils");
const GuardianService = __importStar(require("../services/guardian.service"));
const network_1 = require("../config/network");
const testing_wallet_helper_functions_1 = require("testing-wallet-helper-functions");
exports.post = (0, utils_1.catchAsync)(async (req, res) => {
    const params = req.body;
    const response = await GuardianService.create(params.walletAddress, params.newOwner, params.network);
    res.send(response);
});
exports.sign = (0, utils_1.catchAsync)(async (req, res) => {
    const { id, signedMessage } = req.body;
    await GuardianService.signRecoveryRequest(id, signedMessage);
    res.send({ success: true });
});
exports.fetchByAddress = (0, utils_1.catchAsync)(async (req, res) => {
    const { walletAddress, network } = req.query;
    const walletRequests = await GuardianService.findByWalletAddress(walletAddress, network);
    const responses = [];
    for (const request of walletRequests) {
        const requestJSON = await (request.toJSON());
        const requestId = testing_wallet_helper_functions_1.wallet.message.requestId(requestJSON.userOperation, testing_wallet_helper_functions_1.contracts.EntryPoint.address, network_1.NetworkChainIds[request.network]);
        const object = { ...requestJSON, requestId: requestId, userOperation: null };
        responses.push(object);
    }
    res.send(responses);
});
exports.fetchById = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.query;
    const walletRequests = await GuardianService.findById(id);
    const responses = [];
    for (const request of walletRequests) {
        const requestJSON = await (request.toJSON());
        const requestId = testing_wallet_helper_functions_1.wallet.message.requestId(requestJSON.userOperation, testing_wallet_helper_functions_1.contracts.EntryPoint.address, network_1.NetworkChainIds[request.network]);
        const object = { ...requestJSON, requestId: requestId, userOperation: null };
        responses.push(object);
    }
    res.send(responses);
});
