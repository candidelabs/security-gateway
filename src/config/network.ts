import {BigNumberish} from "ethers";
import {Env} from "./env";

export type Networks = "Goerli" | "Optimism" | "Optimism Goerli";

export const ValidNetworks: Array<Networks> = ["Goerli", "Optimism", "Optimism Goerli"];

interface NetworksConfig {
  name: string;
  chainId: BigNumberish;
  client: string;
  socialRecoveryModuleAddress: string;
}

const initNetworksConfig = (): Record<Networks, NetworksConfig> => {
  return {
    Goerli: {
      name: "Goerli",
      chainId: "5",
      socialRecoveryModuleAddress: "0xCbf67d131Fa0775c5d18676c58de982c349aFC0b",
      client: Env.GOERLI_RPC,
    },
    "Optimism Goerli": {
      name: "Optimism Goerli",
      chainId: "420",
      socialRecoveryModuleAddress: "0xCbf67d131Fa0775c5d18676c58de982c349aFC0b",
      client: Env.OPTIMISM_GOERLI_RPC,
    },
    Optimism: {
      name: "Optimism",
      chainId: "10",
      socialRecoveryModuleAddress: "0x4490F5eca1814a24a9ed9203DFA1B2FdE3795C9e",
      client: Env.OPTIMISM_RPC,
    },
  };
};

export const NetworksConfig = initNetworksConfig();