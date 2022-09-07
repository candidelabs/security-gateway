import Joi from "joi";
import { wallet } from "testing-wallet-helper-functions";
import { ethereumAddress } from "./custom.validation";
import {ValidNetworks} from "../config";

export const post = {
  body: Joi.object().keys({
    walletAddress: Joi.required().custom(ethereumAddress),
    newOwner: Joi.required().custom(ethereumAddress),
    network: Joi.string().valid(...ValidNetworks).required(),
  }),
};

export const sign = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    signedMessage: Joi.string().required(),
  }),
};

export const fetchByAddress = {
  query: Joi.object().keys({
    walletAddress: Joi.custom(ethereumAddress).required(),
    network: Joi.string().valid(...ValidNetworks).required(),
  }),
};

export const fetchById = {
  query: Joi.object().keys({
    id: Joi.string().required(),
  }),
};
