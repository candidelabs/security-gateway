"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = exports.findByWalletAddress = exports.getHashedMessage = exports.signRecoveryRequest = exports.create = void 0;
const http_status_1 = __importDefault(require("http-status"));
const testing_wallet_helper_functions_1 = require("testing-wallet-helper-functions");
const recoveryRequest_model_1 = __importDefault(require("../models/recoveryRequest.model"));
const utils_1 = require("../utils");
const ethers_1 = require("ethers");
const network_1 = require("../config/network");
const rpc_1 = require("../utils/rpc");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const create = async (walletAddress, newOwner, network) => {
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    if (await recoveryRequest_model_1.default.findOne({ walletAddress: walletAddress, createdAt: { $gte: lastHour } })) {
        throw new utils_1.ApiError(http_status_1.default.TOO_MANY_REQUESTS, `You hit a rate limit for recovery creations`);
    }
    let nonce = 0;
    try {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider((0, rpc_1.getRPC)(network));
        nonce = await testing_wallet_helper_functions_1.wallet.proxy.getNonce(provider, walletAddress);
    }
    catch (e) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Lost wallet address is not a smart contract wallet`);
    }
    return recoveryRequest_model_1.default.create({
        emoji: (0, utils_1.createEmojiSet)(15, false),
        walletAddress,
        newOwner,
        network,
        userOperation: testing_wallet_helper_functions_1.wallet.userOperations.get(walletAddress, {
            callData: testing_wallet_helper_functions_1.wallet.encodeFunctionData.transferOwner(walletAddress),
            nonce,
        }),
        signers: [],
        signatures: [],
        status: "PENDING",
        discoverable: true,
    });
};
exports.create = create;
const signRecoveryRequest = async (requestId, signature) => {
    const recoveryRequest = await recoveryRequest_model_1.default.findOne({ id: requestId });
    if (!recoveryRequest) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Could not find recovery request by id`);
    }
    const signer = ethers_1.ethers.utils.verifyMessage(await (0, exports.getHashedMessage)(recoveryRequest), signature);
    if (!signer) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Invalid signer`);
    }
    const signers = recoveryRequest.signers.push(signer);
    const signatures = recoveryRequest.signatures.push(signature);
    recoveryRequest.set({ signers, signatures });
    await recoveryRequest.save();
    //
    await runRelayChecks(recoveryRequest);
    //
    return true;
};
exports.signRecoveryRequest = signRecoveryRequest;
const runRelayChecks = async (recoveryRequest) => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider((0, rpc_1.getRPC)(recoveryRequest.network));
    const lostWallet = await testing_wallet_helper_functions_1.contracts.Wallet.getInstance(provider).attach(recoveryRequest.walletAddress);
    const nonce = await testing_wallet_helper_functions_1.wallet.proxy.getNonce(provider, recoveryRequest.walletAddress);
    if (nonce !== recoveryRequest.userOperation.nonce) {
        recoveryRequest.set({ discoverable: false });
        await recoveryRequest.save();
        return false;
    }
    //
    const guardiansCount = (await lostWallet.getGuardiansCount()).toNumber();
    const guardians = [];
    for (let i = 0; i < guardiansCount; i++) {
        const guardianAddress = await lostWallet.getGuardian(i);
        guardians.push(guardianAddress);
    }
    const signers = [];
    const signatures = [];
    for (let i = 0; i < recoveryRequest.signers.length; i++) {
        const signerAddress = recoveryRequest.signers[i];
        if (guardians.includes(signerAddress)) {
            signers.push(signerAddress);
            signatures.push(recoveryRequest.signatures[i]);
        }
    }
    recoveryRequest.set({ signers, signatures });
    await recoveryRequest.save();
    //
    const minimumGuardians = (await lostWallet.getMinGuardiansSignatures()).toNumber();
    if (signers.length < minimumGuardians) {
        return false;
    }
    // if all checks pass, relay to bundler
    await relayUserOperations([recoveryRequest.userOperation], recoveryRequest.network);
};
const relayUserOperations = async (userOperations, network) => {
    await axios_1.default.post(`${config_1.Env.BUNDLER_URL}/v1/relay/submit`, { userOperations, network });
};
const getHashedMessage = async (recoveryRequest) => {
    return ethers_1.ethers.utils.arrayify(testing_wallet_helper_functions_1.wallet.message.requestId(recoveryRequest.userOperation, testing_wallet_helper_functions_1.contracts.EntryPoint.address, network_1.NetworkChainIds[recoveryRequest.network]));
};
exports.getHashedMessage = getHashedMessage;
const findByWalletAddress = async (walletAddress, network) => {
    return recoveryRequest_model_1.default.find({ walletAddress, network, discoverable: true }, { signers: 0, signatures: 0 });
};
exports.findByWalletAddress = findByWalletAddress;
const findById = async (id) => {
    return recoveryRequest_model_1.default.findOne({ _id: id, discoverable: true }, { signers: 0 });
};
exports.findById = findById;
