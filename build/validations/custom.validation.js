"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethereumAddress = void 0;
const ethereumAddress = (value, helpers) => {
    if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
        return helpers.message({
            custom: "{{#label}} must be a valid ethereum address",
        });
    }
    return value;
};
exports.ethereumAddress = ethereumAddress;
