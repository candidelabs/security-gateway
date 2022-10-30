import {BigNumber, ethers} from "ethers";
import socialSource from "./source/SocialRecoveryModule.json";
import walletSource from "./source/EIP4337Manager.json";

export const getNonce = async (
  walletAddress: string,
  provider: ethers.providers.Provider,
) => {
  const w = getInstance(walletAddress, provider);
  return w.nonce().then((nonce: BigNumber) => nonce.toNumber());
};

export const getInstance = (address: string, provider: ethers.providers.Provider) =>
  new ethers.Contract(address, walletSource.abi, provider);

export const getSocialModuleInstance = (address: string, provider: ethers.providers.Provider) =>
  new ethers.Contract(address, socialSource.abi, provider);