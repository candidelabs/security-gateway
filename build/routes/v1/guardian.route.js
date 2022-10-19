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
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const guardianValidation = __importStar(require("../../validations/guardian.validation"));
const guardianController = __importStar(require("../../controller/guardian.controller"));
const router = express_1.default.Router();
router.route("/create").post((0, middlewares_1.validate)(guardianValidation.post), guardianController.post);
router
    .route("/submit")
    .post((0, middlewares_1.validate)(guardianValidation.submit), guardianController.submit);
router
    .route("/sign")
    .post((0, middlewares_1.validate)(guardianValidation.sign), guardianController.sign);
router
    .route("/fetchByAddress")
    .get((0, middlewares_1.validate)(guardianValidation.fetchByAddress), guardianController.fetchByAddress);
router
    .route("/fetchById")
    .get((0, middlewares_1.validate)(guardianValidation.fetchById), guardianController.fetchById);
exports.default = router;
