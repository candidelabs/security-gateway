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
            callData: testing_wallet_helper_functions_1.wallet.encodeFunctionData.transferOwner(newOwner),
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
    console.log("K0");
    const recoveryRequest = await recoveryRequest_model_1.default.findOne({ id: requestId });
    console.log("K1");
    if (!recoveryRequest) {
        console.log("K2");
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Could not find recovery request by id`);
    }
    console.log("K3");
    const signer = ethers_1.ethers.utils.verifyMessage(await (0, exports.getHashedMessage)(recoveryRequest), ethers_1.ethers.utils.arrayify(signature));
    console.log("K4");
    if (!signer) {
        throw new utils_1.ApiError(http_status_1.default.BAD_REQUEST, `Invalid signature`);
    }
    console.log(`K6 - ${signer} - ${signature}`);
    const recoveryRequestJSON = recoveryRequest.toJSON();
    const signers = recoveryRequestJSON.signers;
    signers.push(signer);
    console.log(`K6 - ${signers}`);
    const signatures = recoveryRequestJSON.signatures;
    signatures.push(signature);
    console.log(`K7 - ${signatures}`);
    recoveryRequest.set({ signers, signatures });
    console.log("K8");
    await recoveryRequest.save();
    console.log("K9");
    //
    await runRelayChecks(recoveryRequest);
    console.log("K10");
    //
    return true;
};
exports.signRecoveryRequest = signRecoveryRequest;
const runRelayChecks = async (recoveryRequest) => {
    console.log("P0");
    const recoveryRequestJSON = recoveryRequest.toJSON();
    const provider = new ethers_1.ethers.providers.JsonRpcProvider((0, rpc_1.getRPC)(recoveryRequest.network));
    const lostWallet = await testing_wallet_helper_functions_1.contracts.Wallet.getInstance(provider).attach(recoveryRequest.walletAddress);
    const nonce = (await lostWallet.nonce()).toNumber();
    console.log("P1");
    if (nonce !== recoveryRequestJSON.userOperation.nonce) {
        console.log("P2");
        recoveryRequest.set({ discoverable: false });
        await recoveryRequest.save();
        console.log("P3");
        return false;
    }
    console.log("P4");
    //
    const guardiansCount = (await lostWallet.getGuardiansCount()).toNumber();
    const guardians = [];
    console.log("P5");
    for (let i = 0; i < guardiansCount; i++) {
        console.log("P6");
        const guardianAddress = await lostWallet.getGuardian(i);
        guardians.push(guardianAddress);
    }
    console.log("P7");
    const signers = [];
    const signatures = [];
    for (let i = 0; i < recoveryRequestJSON.signers.length; i++) {
        console.log("P8");
        const signerAddress = recoveryRequestJSON.signers[i];
        if (guardians.includes(signerAddress)) {
            signers.push(signerAddress);
            signatures.push(recoveryRequestJSON.signatures[i]);
        }
    }
    console.log("P9");
    recoveryRequest.set({ signers, signatures });
    await recoveryRequest.save();
    console.log("P10");
    //
    const minimumGuardians = (await lostWallet.getMinGuardiansSignatures()).toNumber();
    console.log("P11");
    if (signers.length < minimumGuardians) {
        console.log("P12");
        return false;
    }
    console.log("P13");
    // if all checks pass, relay to bundler
    await relayUserOperations([recoveryRequest.userOperation], recoveryRequest.network);
    //recoveryRequest.set({status: "SUCCESS"});
    //await recoveryRequest.save();
};
const relayUserOperations = async (userOperations, network) => {
    console.log("Emulation: ops relayed");
    /*await axios.post(
      `${Env.BUNDLER_URL}/v1/relay/submit`,
      {userOperations, network},
    );*/
};
const getHashedMessage = async (recoveryRequest) => {
    return ethers_1.ethers.utils.arrayify(testing_wallet_helper_functions_1.wallet.message.requestId(recoveryRequest.toJSON().userOperation, testing_wallet_helper_functions_1.contracts.EntryPoint.address, network_1.NetworkChainIds[recoveryRequest.network]));
};
exports.getHashedMessage = getHashedMessage;
const findByWalletAddress = async (walletAddress, network) => {
    return recoveryRequest_model_1.default.find({ walletAddress, network, discoverable: true }, { signers: 0 });
};
exports.findByWalletAddress = findByWalletAddress;
const findById = async (id) => {
    return recoveryRequest_model_1.default.findOne({ _id: id, discoverable: true }, { signers: 0 });
};
exports.findById = findById;
