import httpStatus from "http-status";
import { catchAsync, ApiError } from "../utils";
import * as GuardianService from "../services/guardian.service";
import {NetworkChainIds, Networks} from "../config/network";
import {contracts, wallet} from "testing-wallet-helper-functions";

interface PostRequestBody {
  walletAddress: string;
  newOwner: string;
  network: Networks;
}

interface SignRequestBody {
  id: string;
  signedMessage: string;
}


export const post = catchAsync(async (req, res) => {
  const params = req.body as PostRequestBody;
  const response = await GuardianService.create(params.walletAddress, params.newOwner, params.network);

  res.send(response);
});

export const sign = catchAsync(async (req, res) => {
  console.log("M0");
  const { id, signedMessage } = req.body as SignRequestBody;
  console.log("M1");

  console.log("M2");
  await GuardianService.signRecoveryRequest(
    id, signedMessage
  );
  console.log("M3");

  res.send({success:true});
});

export const fetchByAddress = catchAsync(async (req, res) => {
  const { walletAddress, network } = req.query as {
    walletAddress: string;
    network: Networks;
  };

  const walletRequests = await GuardianService.findByWalletAddress(
    walletAddress,
    network
  );
  const responses = [];
  for (const request of walletRequests){
    const requestJSON = await (request.toJSON());
    const requestId = wallet.message.requestId(requestJSON.userOperation, contracts.EntryPoint.address, NetworkChainIds[request.network]);
    const object = {...requestJSON, requestId: requestId, signaturesAcquired: requestJSON.signatures.length, userOperation: null, signatures: null};
    responses.push(object);
  }

  res.send(responses);
});

export const fetchById = catchAsync(async (req, res) => {
  const { id } = req.query as {
    id: string;
  };

  const request = await GuardianService.findById(
    id,
  );
  if (request == null){
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Recovery request not found`
    );
  }

  const requestJSON = await (request.toJSON());
  const requestId = wallet.message.requestId(requestJSON.userOperation, contracts.EntryPoint.address, NetworkChainIds[request.network]);
  const object = {...requestJSON, requestId: requestId, signaturesAcquired: requestJSON.signatures.length, userOperation: null, signatures: null};

  res.send(object);
});
