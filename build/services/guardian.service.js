"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = exports.findByWalletAddress = exports.signDataHash = exports.submit = exports.create = void 0;
const http_status_1 = __importDefault(require("http-status"));
const testing_wallet_helper_functions_1 = require("testing-wallet-helper-functions");
const recoveryRequest_model_1 = __importDefault(require("../models/recoveryRequest.model"));
const utils_1 = require("../utils");
const ethers_1 = require("ethers");
const rpc_1 = require("../utils/rpc");
const create = async (walletAddress, socialRecoveryAddress, oldOwner, newOwner, dataHash, network) => {
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
        socialRecoveryAddress,
        oldOwner,
        newOwner,
        network,
        dataHash,
        signers: [],
        signatures: [],
        status: "PENDING",
        readyToSubmit: false,
        discoverable: true,
    });
};
exports.create = create;
const submit = async (id, transactionHash) => {
    const recoveryRequest = await recoveryRequest_model_1.default.findOne({ _id: id });
    if (!recoveryRequest) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Could not find recovery request by id`);
    }
    //
    recoveryRequest.set({ transactionHash, discoverable: false, status: "SUCCESS" });
    await recoveryRequest.save();
    //
    return true;
};
exports.submit = submit;
const signDataHash = async (id, signedMessage) => {
    const recoveryRequest = await recoveryRequest_model_1.default.findOne({ _id: id });
    if (!recoveryRequest) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Could not find recovery request by id`);
    }
    const signer = ethers_1.ethers.utils.verifyMessage(ethers_1.ethers.utils.arrayify(recoveryRequest.dataHash), ethers_1.ethers.utils.arrayify(signedMessage));
    if (!signer) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Invalid signature`);
    }
    const recoveryRequestJSON = recoveryRequest.toJSON();
    const signers = recoveryRequestJSON.signers;
    const signatures = recoveryRequestJSON.signatures;
    //
    if (!signers.includes(signer)) {
        signers.push(signer);
        signatures.push(signedMessage);
    }
    else {
        return true;
    }
    //
    recoveryRequest.set({ signers, signatures });
    await recoveryRequest.save();
    //
    await runRelayChecks(recoveryRequest);
    //
    return true;
};
exports.signDataHash = signDataHash;
const runRelayChecks = async (recoveryRequest) => {
    const recoveryRequestJSON = recoveryRequest.toJSON();
    const provider = new ethers_1.ethers.providers.JsonRpcProvider((0, rpc_1.getRPC)(recoveryRequest.network));
    const socialRecoveryModule = await testing_wallet_helper_functions_1.contracts.Wallet.getSocialModuleInstance(provider).attach(recoveryRequest.socialRecoveryAddress);
    /*const nonce = (await lostWallet.nonce()).toNumber();
    if (nonce !== recoveryRequestJSON.userOperation.nonce){
      recoveryRequest.set({discoverable: false, signers: [], signatures: []});
      await recoveryRequest.save();
      return false;
    }*/
    //
    const guardiansCount = (await socialRecoveryModule.friendsCount()).toNumber();
    const guardians = [];
    for (let i = 0; i < guardiansCount; i++) {
        const guardianAddress = await socialRecoveryModule.friends(i);
        guardians.push(guardianAddress);
    }
    const signers = [];
    const signatures = [];
    for (let i = 0; i < recoveryRequestJSON.signers.length; i++) {
        const signerAddress = recoveryRequestJSON.signers[i];
        if (guardians.includes(signerAddress)) {
            signers.push(signerAddress);
            signatures.push(recoveryRequestJSON.signatures[i]);
        }
    }
    recoveryRequest.set({ signers, signatures });
    await recoveryRequest.save();
    //
    const minimumGuardians = (await socialRecoveryModule.threshold()).toNumber();
    if (signers.length < minimumGuardians) {
        return false;
    }
    recoveryRequest.set({ readyToSubmit: true });
    await recoveryRequest.save();
    //
    return true;
};
const findByWalletAddress = async (walletAddress, network) => {
    walletAddress = '^' + walletAddress + '$';
    return recoveryRequest_model_1.default.find({ 'walletAddress': { '$regex': walletAddress, $options: 'i' }, network, discoverable: true }, { signers: 0 });
};
exports.findByWalletAddress = findByWalletAddress;
const findById = async (id) => {
    return recoveryRequest_model_1.default.findOne({ _id: id }, { signers: 0 });
};
exports.findById = findById;
