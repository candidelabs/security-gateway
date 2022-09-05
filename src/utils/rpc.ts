import { Env, Networks } from "../config";

export const getRPC = (network: Networks) => {
  switch (network) {
    case "Goerli":
      return Env.ALCHEMY_GOERLI_RPC;

    default:
      return Env.ALCHEMY_GOERLI_RPC;
  }
};
