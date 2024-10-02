import {BigNumberish} from "ethers";
import {Env} from "./env";

export type Networks = "Sepolia" | "Optimism" | "Optimism Sepolia";

export const ValidNetworks: Array<Networks> = ["Sepolia", "Optimism", "Optimism Sepolia"];

interface NetworksConfig {
  name: string;
  chainId: BigNumberish;
  client: string;
  socialRecoveryModuleAddress: string;
}

const initNetworksConfig = (): Record<Networks, NetworksConfig> => {
  return {
    "Sepolia": {
      name: "Sepolia",
      chainId: "11155111",
      socialRecoveryModuleAddress: "0x949d01d424bE050D09C16025dd007CB59b3A8c66",
      client: Env.SEPOLIA_RPC,
    },
    "Optimism Sepolia": {
      name: "Optimism Sepolia",
      chainId: "11155420",
      socialRecoveryModuleAddress: "0x831153c6b9537d0fF5b7DB830C2749DE3042e776",
      client: Env.OPTIMISM_SEPOLIA_RPC,
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