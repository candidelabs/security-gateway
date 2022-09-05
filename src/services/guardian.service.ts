import httpStatus from "http-status";
import { wallet, contracts } from "testing-wallet-helper-functions";
import RecoverRequest, {IRecoveryRequest} from "../models/recoveryRequest.model";
import {ApiError, createEmojiSet} from "../utils";
import {ethers} from "ethers";
import {NetworkChainIds, Networks} from "../config/network";
import {getRPC} from "../utils/rpc";
import axios from "axios";
import {IUserOperation} from "testing-wallet-helper-functions/lib/constants/userOperations";
import {Env} from "../config";

export const create = async (walletAddress: string, newOwner: string, network: string) => {
  const lastHour = new Date();
  lastHour.setHours(lastHour.getHours() - 1);
  if (await RecoverRequest.findOne({ createdAt: { $gte: lastHour} })) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `You hit a rate limit for recovery creations`
    );
  }
  const provider = new ethers.providers.JsonRpcProvider(getRPC(network));
  const nonce = await wallet.proxy.getNonce(provider, walletAddress);
  return RecoverRequest.create(
    {
      emoji: createEmojiSet(15, false),
      walletAddress,
      newOwner,
      network,
      userOperation: wallet.userOperations.get(
        walletAddress,
        {
          callData: wallet.encodeFunctionData.transferOwner(walletAddress),
          nonce,
        }
      ),
      signers: [],
      signatures: [],
      status: "PENDING",
      discoverable: true,
    }
  );
};

export const signRecoveryRequest = async (requestId: string, signature: string) => {
  const recoveryRequest = await RecoverRequest.findOne({ id: requestId });
  if (!recoveryRequest){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Could not find recovery request by id`
    );
  }
  const signer = ethers.utils.verifyMessage(await getHashedMessage(recoveryRequest), signature);
  if (!signer){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid signer`
    );
  }
  const signers = recoveryRequest.signers.push(signer);
  const signatures = recoveryRequest.signatures.push(signature);
  recoveryRequest.set({signers, signatures});
  await recoveryRequest.save();
  //
  await runRelayChecks(recoveryRequest);
  //
  return true;
};

const runRelayChecks = async (recoveryRequest: IRecoveryRequest) => {
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const lostWallet = await contracts.Wallet.getInstance(provider).attach(recoveryRequest.walletAddress);
  const nonce = await wallet.proxy.getNonce(provider, recoveryRequest.walletAddress);
  if (nonce !== recoveryRequest.userOperation.nonce){
    recoveryRequest.set({discoverable: false});
    await recoveryRequest.save();
    return false;
  }
  //
  const guardiansCount = (await lostWallet.getGuardiansCount()).toNumber();
  const guardians = [];
  for (let i = 0; i < guardiansCount; i++) {
    const guardianAddress = await lostWallet.getGuardian(i);
    guardians.push(guardianAddress);
  }
  const signers = [];
  const signatures = [];
  for (let i = 0; i < recoveryRequest.signers.length; i++){
    const signerAddress = recoveryRequest.signers[i];
    if (guardians.includes(signerAddress)){
      signers.push(signerAddress);
      signatures.push(recoveryRequest.signatures[i]);
    }
  }
  recoveryRequest.set({signers, signatures});
  await recoveryRequest.save();
  //
  const minimumGuardians = (await lostWallet.getMinGuardiansSignatures()).toNumber();
  if (signers.length < minimumGuardians){
    return false;
  }
  // if all checks pass, relay to bundler
  await relayUserOperations([recoveryRequest.userOperation], recoveryRequest.network);
}


const relayUserOperations = async (userOperations: Array<IUserOperation>, network: Networks) => {
  await axios.post(
    `${Env.BUNDLER_URL}/v1/relay/submit`,
    {userOperations, network},
  );
}


export const getHashedMessage = async (recoveryRequest: IRecoveryRequest) => {
  return ethers.utils.arrayify(
    wallet.message.requestId(recoveryRequest.userOperation, contracts.EntryPoint.address, NetworkChainIds[recoveryRequest.network])
  );
}

export const findByWalletAddress = async (walletAddress: string) => {
  return RecoverRequest.find({ walletAddress, discoverable:true }, {signers: 0, signatures: 0});
};
