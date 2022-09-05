import Joi from "joi";
import { wallet } from "testing-wallet-helper-functions";
import { ethereumAddress } from "./custom.validation";

export const post = {
  body: Joi.object().keys({
    walletAddress: Joi.required().custom(ethereumAddress),
    newOwner: Joi.required().custom(ethereumAddress),
    network: Joi.string().required(),
  }),
};

export const sign = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    signedMessage: Joi.string().required(),
  }),
};

export const fetch = {
  query: Joi.object().keys({
    walletAddress: Joi.custom(ethereumAddress).required(),
  }),
};
