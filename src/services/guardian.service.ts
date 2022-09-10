import httpStatus from "http-status";
import { wallet, contracts } from "testing-wallet-helper-functions";
import RecoverRequest, {IRecoveryRequest} from "../models/recoveryRequest.model";
import {ApiError, createEmojiSet} from "../utils";
import {ethers} from "ethers";
import {NetworkChainIds, Networks} from "../config/network";
import {getRPC} from "../utils/rpc";
import {IUserOperation} from "testing-wallet-helper-functions/lib/constants/userOperations";

export const create = async (walletAddress: string, newOwner: string, network: Networks) => {
  const lastHour = new Date();
  lastHour.setHours(lastHour.getHours() - 1);
  if (await RecoverRequest.findOne({ walletAddress: walletAddress, createdAt: { $gte: lastHour} })) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `You hit a rate limit for recovery creations`
    );
  }
  let nonce = 0;
  try {
    const provider = new ethers.providers.JsonRpcProvider(getRPC(network));
    nonce = await wallet.proxy.getNonce(provider, walletAddress);
  } catch (e) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Lost wallet address is not a smart contract wallet`
    );
  }
  return RecoverRequest.create(
    {
      emoji: createEmojiSet(15, false),
      walletAddress,
      newOwner,
      network,
      userOperation: wallet.userOperations.get(
        walletAddress,
        {
          callData: wallet.encodeFunctionData.transferOwner(newOwner),
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
  const signer = ethers.utils.verifyMessage(await getHashedMessage(recoveryRequest), ethers.utils.arrayify(signature));
  if (!signer){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid signature`
    );
  }
  const recoveryRequestJSON = recoveryRequest.toJSON();
  const signers = recoveryRequestJSON.signers;
  signers.push(signer);
  const signatures = recoveryRequestJSON.signatures;
  signatures.push(signature);
  recoveryRequest.set({signers, signatures});
  await recoveryRequest.save();
  //
  await runRelayChecks(recoveryRequest);
  //
  return true;
};

const runRelayChecks = async (recoveryRequest: IRecoveryRequest) => {
  const recoveryRequestJSON = recoveryRequest.toJSON();
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const lostWallet = await contracts.Wallet.getInstance(provider).attach(recoveryRequest.walletAddress);
  const nonce = (await lostWallet.nonce()).toNumber();
  if (nonce !== recoveryRequestJSON.userOperation.nonce){
    recoveryRequest.set({discoverable: false, signers: [], signatures: []});
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
  for (let i = 0; i < recoveryRequestJSON.signers.length; i++){
    const signerAddress = recoveryRequestJSON.signers[i];
    if (guardians.includes(signerAddress)){
      signers.push(signerAddress);
      signatures.push(recoveryRequestJSON.signatures[i]);
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
  //recoveryRequest.set({status: "SUCCESS"});
  //await recoveryRequest.save();
}


const relayUserOperations = async (userOperations: Array<IUserOperation>, network: Networks) => {
  console.log("Emulation: ops relayed");
  /*await axios.post(
    `${Env.BUNDLER_URL}/v1/relay/submit`,
    {userOperations, network},
  );*/
}


export const getHashedMessage = async (recoveryRequest: IRecoveryRequest) => {
  return ethers.utils.arrayify(
    wallet.message.requestId(recoveryRequest.toJSON().userOperation, contracts.EntryPoint.address, NetworkChainIds[recoveryRequest.network])
  );
}

export const findByWalletAddress = async (walletAddress: string, network: Networks) => {
  return RecoverRequest.find({ walletAddress, network, discoverable:true }, {signers: 0});
};

export const findById = async (id: string) => {
  return RecoverRequest.findOne({ _id: id, discoverable:true }, {signers: 0});
};
