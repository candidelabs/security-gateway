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
  console.log("K0")
  const recoveryRequest = await RecoverRequest.findOne({ id: requestId });
  console.log("K1")
  if (!recoveryRequest){
    console.log("K2")
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Could not find recovery request by id`
    );
  }
  console.log("K3")
  const signer = ethers.utils.verifyMessage(await getHashedMessage(recoveryRequest), ethers.utils.arrayify(signature));
  console.log("K4")
  if (!signer){
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid signature`
    );
  }
  console.log(`K6 - ${signer} - ${signature}`)
  const recoveryRequestJSON = recoveryRequest.toJSON();
  const signers = recoveryRequestJSON.signers;
  signers.push(signer);
  console.log(`K6 - ${signers}`)
  const signatures = recoveryRequestJSON.signatures;
  signatures.push(signature);
  console.log(`K7 - ${signatures}`)
  recoveryRequest.set({signers, signatures});
  console.log("K8")
  await recoveryRequest.save();
  console.log("K9")
  //
  await runRelayChecks(recoveryRequest);
  console.log("K10")
  //
  return true;
};

const runRelayChecks = async (recoveryRequest: IRecoveryRequest) => {
  console.log("P0")
  const recoveryRequestJSON = recoveryRequest.toJSON();
  const provider = new ethers.providers.JsonRpcProvider(getRPC(recoveryRequest.network));
  const lostWallet = await contracts.Wallet.getInstance(provider).attach(recoveryRequest.walletAddress);
  const nonce = (await lostWallet.nonce()).toNumber();
  console.log("P1")
  if (nonce !== recoveryRequestJSON.userOperation.nonce){
    console.log("P2")
    recoveryRequest.set({discoverable: false});
    await recoveryRequest.save();
    console.log("P3")
    return false;
  }
  console.log("P4")
  //
  const guardiansCount = (await lostWallet.getGuardiansCount()).toNumber();
  const guardians = [];
  console.log("P5")
  for (let i = 0; i < guardiansCount; i++) {
    console.log("P6")
    const guardianAddress = await lostWallet.getGuardian(i);
    guardians.push(guardianAddress);
  }
  console.log("P7")
  const signers = [];
  const signatures = [];
  for (let i = 0; i < recoveryRequestJSON.signers.length; i++){
    console.log("P8")
    const signerAddress = recoveryRequestJSON.signers[i];
    if (guardians.includes(signerAddress)){
      signers.push(signerAddress);
      signatures.push(recoveryRequestJSON.signatures[i]);
    }
  }
  console.log("P9")
  recoveryRequest.set({signers, signatures});
  await recoveryRequest.save();
  console.log("P10")
  //
  const minimumGuardians = (await lostWallet.getMinGuardiansSignatures()).toNumber();
  console.log("P11")
  if (signers.length < minimumGuardians){
    console.log("P12")
    return false;
  }
  console.log("P13")
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
