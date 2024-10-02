import { Env, Networks } from "../config";

export const getRPC = (network: Networks) => {
  switch (network) {
    case "Sepolia":
      return Env.SEPOLIA_RPC;
    case "Optimism Sepolia":
      return Env.OPTIMISM_SEPOLIA_RPC;
    case "Optimism":
      return Env.OPTIMISM_RPC;

    default:
      return Env.OPTIMISM_RPC;
  }
};
