import { Env, Networks } from "../config";

export const getRPC = (network: Networks) => {
  switch (network) {
    case "Goerli":
      return Env.GOERLI_RPC;
    case "Optimism Goerli":
      return Env.OPTIMISM_GOERLI_RPC;
    case "Optimism":
      return Env.OPTIMISM_RPC;

    default:
      return Env.OPTIMISM_RPC;
  }
};
