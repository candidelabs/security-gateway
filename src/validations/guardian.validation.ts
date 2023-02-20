import Joi from "joi";
import { ethereumAddress } from "./custom.validation";
import {ValidNetworks} from "../config";

export const create = {
  body: Joi.object().keys({
    accountAddress: Joi.required().custom(ethereumAddress),
    newOwner: Joi.required().custom(ethereumAddress),
    network: Joi.string().valid(...ValidNetworks).required(),
  }),
};

export const submit = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    transactionHash: Joi.string().required(),
  }),
};

export const sign = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    signer: Joi.string().required(),
    signedMessage: Joi.string().required(),
  }),
};

export const fetchByAddress = {
  query: Joi.object().keys({
    accountAddress: Joi.custom(ethereumAddress).required(),
    network: Joi.string().valid(...ValidNetworks).required(),
    nonce: Joi.number().integer().greater(-1).required(),
  }),
};

export const fetchById = {
  query: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export const finalize = {
  body: Joi.object().keys({
    id: Joi.string().required(),
  }),
};
