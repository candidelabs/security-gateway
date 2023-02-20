import {BigNumber, ethers} from "ethers";
import socialSource from "./source/SocialRecoveryModule.json";
import walletSource from "./source/CandideWallet.json";

export const getNonce = async (
  accountAddress: string,
  provider: ethers.providers.Provider,
) => {
  const w = getInstance(accountAddress, provider);
  return w.nonce().then((nonce: BigNumber) => nonce.toNumber());
};

export const getInstance = (address: string, provider: ethers.providers.Provider) =>
  new ethers.Contract(address, walletSource.abi, provider);

export const getSocialModuleInstance = (address: string, provider: ethers.providers.Provider) =>
  new ethers.Contract(address, socialSource.abi, provider);