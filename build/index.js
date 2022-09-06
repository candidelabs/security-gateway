"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const queue_1 = __importDefault(require("./queue"));
const config_1 = require("./config");
const utils_1 = require("./utils");
mongoose_1.default.connect(config_1.Env.MONGO_URL).then(() => {
    utils_1.logger.info("Connected to MongoDB");
    app_1.default.listen(config_1.Env.PORT, () => {
        utils_1.logger.info(`Listening to port ${config_1.Env.PORT}`);
    });
    queue_1.default.start().then(() => {
        utils_1.logger.info("Connected to job queue");
    });
});
