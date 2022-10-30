import httpStatus from "http-status";
import RecoverRequest, {IRecoveryRequest} from "../models/recoveryRequest.model";
import {ApiError, createEmojiSet} from "../utils";
import {ethers} from "ethers";
import {Networks} from "../config";
import {getRPC} from "../utils/rpc";
import {getNonce, getSocialModuleInstance} from "../utils/contractSource";

export const create = async (walletAddress: string, socialRecoveryAddress: string, oldOwner: string, newOwner: string, dataHash: string, network: Networks) => {
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
    nonce = await getNonce(walletAddress, provider);
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
      socialRecoveryAddress,
      oldOwner,
      newOwner,
      network,
      dataHash,
      signers: [],
      signatures: [],
      status: "PENDING",
      readyToSubmit: false,
      discoverable: true,
    }
  );
};

export const submit = async (id: string, transactionHash: string) => {
  const recoveryRequest = await RecoverRequest.findOne({ _id: id });
  if (!recoveryRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Could not find recovery request by id`
    );
  }
  //
  recoveryRequest.set({transactionHash, discoverable: false, status: "SUCCESS"});
  await recoveryRequest.save();
  //
  return true;
};

export const signDataHash = async (id: string, signedMessage: string) => {
  const recoveryRequest = await RecoverRequest.findOne({ _id: id });
  if (!recoveryRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Could not find recovery request by id`
    );
  }
  const signer = ethers.utils.verifyMessage(ethers.utils.arrayify(recoveryRequest.dataHash), ethers.utils.arrayify(signedMessage));
  if (!signer){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid signature`
    );
  }
  const recoveryRequestJSON = recoveryRequest.toJSON();
  const signers = recoveryRequestJSON.signers;
  const signatures = recoveryRequestJSON.signatures;
  //
  if (!signers.includes(signer)){
    signers.push(signer);
    signatures.push(signedMessage);
  }else{
    return true;
  }
  //
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
  const socialRecoveryModule = await getSocialModuleInstance(recoveryRequest.socialRecoveryAddress, provider);
  /*const nonce = (await lostWallet.nonce()).toNumber();
  if (nonce !== recoveryRequestJSON.userOperation.nonce){
    recoveryRequest.set({discoverable: false, signers: [], signatures: []});
    await recoveryRequest.save();
    return false;
  }*/
  //
  let guardians = await socialRecoveryModule.getFriends();
  guardians = guardians.map((element: string) => {
    return element.toLowerCase();
  });
  const signers = [];
  const signatures = [];
  for (let i = 0; i < recoveryRequestJSON.signers.length; i++){
    const signerAddress = recoveryRequestJSON.signers[i];
    if (guardians.includes(signerAddress.toLowerCase())){
      signers.push(signerAddress);
      signatures.push(recoveryRequestJSON.signatures[i]);
    }
  }
  recoveryRequest.set({signers, signatures});
  await recoveryRequest.save();
  //
  const minimumGuardians = (await socialRecoveryModule.threshold()).toNumber();
  if (signers.length < minimumGuardians){
    return false;
  }
  recoveryRequest.set({readyToSubmit: true});
  await recoveryRequest.save();
  //
  return true;
}

export const findByWalletAddress = async (walletAddress: string, network: Networks) => {
  walletAddress = '^'+walletAddress+'$';
  return RecoverRequest.find({ 'walletAddress': {'$regex': walletAddress, $options:'i'}, network, discoverable:true }, {signers: 0});
};

export const findById = async (id: string) => {
  return RecoverRequest.findOne({ _id: id }, {signers: 0});
};
