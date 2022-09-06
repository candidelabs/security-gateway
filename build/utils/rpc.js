"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRPC = void 0;
const config_1 = require("../config");
const getRPC = (network) => {
    switch (network) {
        case "Goerli":
            return config_1.Env.ALCHEMY_GOERLI_RPC;
        default:
            return config_1.Env.ALCHEMY_GOERLI_RPC;
    }
};
exports.getRPC = getRPC;
