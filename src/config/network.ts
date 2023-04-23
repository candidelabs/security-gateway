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
      socialRecoveryModuleAddress: "0x831153c6b9537d0fF5b7DB830C2749DE3042e776",
      client: Env.GOERLI_RPC,
    },
    "Optimism Goerli": {
      name: "Optimism Goerli",
      chainId: "420",
      socialRecoveryModuleAddress: "0x831153c6b9537d0fF5b7DB830C2749DE3042e776",
      client: Env.OPTIMISM_GOERLI_RPC,
    },
    Optimism: {
      name: "Optimism",
      chainId: "10",
      socialRecoveryModuleAddress: "0xbc1920b63F35FdeD45382e2295E645B5c27fD2DA",
      client: Env.OPTIMISM_RPC,
    },
  };
};

export const NetworksConfig = initNetworksConfig();