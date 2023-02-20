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
      socialRecoveryModuleAddress: "0x0014F33Fc01017d9AC6762E8285b51Ad07089E51",
      client: Env.GOERLI_RPC,
    },
    "Optimism Goerli": {
      name: "Optimism Goerli",
      chainId: "420",
      socialRecoveryModuleAddress: "0x0014F33Fc01017d9AC6762E8285b51Ad07089E51",
      client: Env.OPTIMISM_GOERLI_RPC,
    },
    Optimism: {
      name: "Optimism",
      chainId: "10",
      socialRecoveryModuleAddress: "0x0014F33Fc01017d9AC6762E8285b51Ad07089E51",
      client: Env.OPTIMISM_RPC,
    },
  };
};

export const NetworksConfig = initNetworksConfig();