import httpStatus from "http-status";
import { catchAsync, ApiError } from "../utils";
import * as GuardianService from "../services/guardian.service";
import {NetworkChainIds, Networks} from "../config/network";
import {contracts, wallet} from "testing-wallet-helper-functions";
import {ethers} from "ethers";

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
  const { id, signedMessage } = req.body as SignRequestBody;

  await GuardianService.signRecoveryRequest(
    id, signedMessage
  );

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
    const object = {...requestJSON, requestId: requestId, userOperation: null};
    responses.push(object);
  }

  res.send(responses);
});

export const fetchById = catchAsync(async (req, res) => {
  const { id } = req.query as {
    id: string;
  };

  const walletRequests = await GuardianService.findById(
    id,
  );
  const responses = [];
  for (const request of walletRequests){
    const requestJSON = await (request.toJSON());
    const requestId = wallet.message.requestId(requestJSON.userOperation, contracts.EntryPoint.address, NetworkChainIds[request.network]);
    const object = {...requestJSON, requestId: requestId, userOperation: null};
    responses.push(object);
  }

  res.send(responses);
});
