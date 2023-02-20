import httpStatus from "http-status";
import RecoverRequest, {IRecoveryRequest} from "../models/recoveryRequest.model";
import {ApiError, createEmojiSet} from "../utils";
import {ethers} from "ethers";
import {Env, Networks, NetworksConfig} from "../config";
import {getRPC} from "../utils/rpc";
import {getNonce, getSocialModuleInstance} from "../utils/contractSource";
import {isValidSignature} from "../utils/valid_signature";

export const create = async (accountAddress: string, newOwner: string, network: Networks) => {
  const lastHour = new Date();
  lastHour.setHours(lastHour.getHours() - 1);
  if (await RecoverRequest.findOne({ accountAddress: accountAddress, createdAt: { $gte: lastHour} })) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `You hit a rate limit for recovery creations`
    );
  }
  try {
    const provider = new ethers.providers.JsonRpcProvider(getRPC(network));
    await getNonce(accountAddress, provider);
  } catch (e) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Lost address is not a smart contract account`
    );
  }

  const networkConfig = NetworksConfig[network];
  const provider = new ethers.providers.JsonRpcProvider(getRPC(network));
  const socialRecoveryModule = await getSocialModuleInstance(networkConfig.socialRecoveryModuleAddress, provider);
  const recoveryNonce: number = await socialRecoveryModule.nonce(accountAddress);

  return RecoverRequest.create(
    {
      emoji: createEmojiSet(15, false),
      accountAddress: accountAddress,
      newOwner,
      network,
      nonce: recoveryNonce,
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
  if (recoveryRequest.status === "EXECUTED") return true;
  const network = NetworksConfig[recoveryRequest.network];
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const socialRecoveryModule = await getSocialModuleInstance(network.socialRecoveryModuleAddress, provider);
  //
  const onChainRequest = await socialRecoveryModule.getRecoveryRequest(recoveryRequest.accountAddress,)
  if (onChainRequest.executeAfter === 0){
    throw new ApiError(
        httpStatus.FORBIDDEN,
        `No recovery request found on chain`
    );
  }
  if (onChainRequest.newThreshold != 1
      || onChainRequest.newOwners.length > 1
      || onChainRequest.newOwners[0].toLowerCase() != recoveryRequest.newOwner.toLowerCase()){
    throw new ApiError(
        httpStatus.FORBIDDEN,
        `On chain request is not the same as this request`
    );
  }
  //
  recoveryRequest.set({transactionHash, discoverable: false, status: "EXECUTED"});
  await recoveryRequest.save();
  //
  return true;
};

export const signRecoveryHash = async (id: string, signer: string, signature: string) => {
  const recoveryRequest = await RecoverRequest.findOne({ _id: id });
  if (!recoveryRequest) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Could not find recovery request by id`
    );
  }
  const network = NetworksConfig[recoveryRequest.network];
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const socialRecoveryModule = await getSocialModuleInstance(network.socialRecoveryModuleAddress, provider);
  const isSignerAGuardian: boolean = await socialRecoveryModule.isGuardian(recoveryRequest.accountAddress, signer);
  if (!isSignerAGuardian) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Signer not a guardian`
    );
  }
  //
  const recoveryHash = await getRecoveryRequestExecutionHash(recoveryRequest);
  const validSignature: boolean = await isValidSignature(
    signer,
    ethers.utils.arrayify(recoveryHash),
    ethers.utils.arrayify(signature),
    provider,
  );
  if (!validSignature){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid signature`
    );
  }
  const recoveryRequestJSON = recoveryRequest.toJSON();
  let signatures = recoveryRequestJSON.signatures;
  //
  for (const _signature in signatures) {
    if (_signature[0].toLowerCase() == signer.toLowerCase()) return true;
  }
  signatures.push([signer, signature]);
  //
  signatures = signatures.sort((a: any, b: any) => a[0] - b[0]);
  //
  recoveryRequest.set({signatures});
  await recoveryRequest.save();
  //
  return true;
};

const getRecoveryRequestExecutionHash = async (recoveryRequest: IRecoveryRequest) => {
  const network = NetworksConfig[recoveryRequest.network];
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const socialRecoveryModule = await getSocialModuleInstance(network.socialRecoveryModuleAddress, provider);
  return await socialRecoveryModule.getRecoveryHash(
    recoveryRequest.accountAddress,
    [recoveryRequest.newOwner],
    1,
    recoveryRequest.nonce,
  );
};

export const findByAccountAddress = async (accountAddress: string, network: Networks, nonce: number) => {
  accountAddress = '^'+accountAddress+'$';
  return RecoverRequest.find({ 'accountAddress': {'$regex': accountAddress, $options:'i'}, nonce, network, discoverable:true });
};

export const findById = async (id: string) => {
  return RecoverRequest.findOne({ _id: id });
};

export const finalize = async (request: IRecoveryRequest) => {
  const network = NetworksConfig[request.network];
  const provider = new ethers.providers.JsonRpcProvider(getRPC(request.network));
  let socialRecoveryModule = await getSocialModuleInstance(network.socialRecoveryModuleAddress, provider);
  //
  if (request.status === "FINALIZED") return request.finalizeTransactionHash;
  const onChainRequest = await socialRecoveryModule.getRecoveryRequest(request.accountAddress,)
  if (onChainRequest.executeAfter == 0){
    throw new ApiError(
        httpStatus.NOT_FOUND,
        `No recovery request found on chain`
    );
  }
  const currentTimestamp = (await provider.getBlock("latest")).timestamp;
  if (onChainRequest.executeAfter > currentTimestamp){
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Recovery request is not yet ready for finalization`
    );
  }
  const recoveryRequest = await findById(request.id);
  if (!recoveryRequest){
    throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Recovery request no longer in DB`
    );
  }
  if (recoveryRequest.status === "FINALIZATION-IN-PROGRESS"){
    throw new ApiError(
        httpStatus.FORBIDDEN,
        `Finalization already pending`
    );
  }
  recoveryRequest.set({status: "FINALIZATION-IN-PROGRESS"});
  await recoveryRequest.save();
  const signer = new ethers.Wallet(Env.FINALIZER_SK).connect(provider);
  socialRecoveryModule = socialRecoveryModule.connect(signer)
  try {
    const tx = await socialRecoveryModule.finalizeRecovery(recoveryRequest.accountAddress);
    const submittedTx = await tx.wait();
    const receipt = await provider.getTransactionReceipt(submittedTx.transactionHash);
    if (receipt.status !== 1){
      recoveryRequest.set({status: "EXECUTED"});
      await recoveryRequest.save();
      throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Recovery request finalization failed`
      );
    }
    //
    recoveryRequest.set({finalizeTransactionHash: receipt.transactionHash, status: "FINALIZED"});
    recoveryRequest.set({status: "EXECUTED"}); // todo remove
    await recoveryRequest.save();
    return receipt.transactionHash;
  } catch (e) {
    recoveryRequest.set({status: "EXECUTED"});
    await recoveryRequest.save();
    throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Recovery request finalization failed`
    );
  }
};