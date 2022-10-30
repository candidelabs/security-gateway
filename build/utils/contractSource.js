"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialModuleInstance = exports.getInstance = exports.getNonce = void 0;
const ethers_1 = require("ethers");
const SocialRecoveryModule_json_1 = __importDefault(require("./source/SocialRecoveryModule.json"));
const EIP4337Manager_json_1 = __importDefault(require("./source/EIP4337Manager.json"));
const getNonce = async (walletAddress, provider) => {
    const w = (0, exports.getInstance)(walletAddress, provider);
    return w.nonce().then((nonce) => nonce.toNumber());
};
exports.getNonce = getNonce;
const getInstance = (address, provider) => new ethers_1.ethers.Contract(address, EIP4337Manager_json_1.default.abi, provider);
exports.getInstance = getInstance;
const getSocialModuleInstance = (address, provider) => new ethers_1.ethers.Contract(address, SocialRecoveryModule_json_1.default.abi, provider);
exports.getSocialModuleInstance = getSocialModuleInstance;
