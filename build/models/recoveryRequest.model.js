"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_to_json_1 = __importDefault(require("@meanie/mongoose-to-json"));
const schema = new mongoose_1.Schema({
    emoji: { type: String, required: true },
    walletAddress: { type: String, required: true },
    newOwner: { type: String, required: true },
    network: { type: String, required: true },
    userOperation: { type: Map, required: true },
    signers: [{ type: String, required: true }],
    signatures: [{ type: String, required: true }],
    status: { type: String, required: true },
    discoverable: { type: Boolean, default: true },
}, { timestamps: true });
schema.plugin(mongoose_to_json_1.default);
exports.default = (0, mongoose_1.model)("RecoveryRequest", schema);
