import httpStatus from "http-status";
import { catchAsync, ApiError } from "../utils";
import * as GuardianService from "../services/guardian.service";
import {Networks} from "../config/network";

interface PostRequestBody {
  walletAddress: string;
  socialRecoveryAddress: string;
  oldOwner: string;
  newOwner: string;
  dataHash: string;
  network: Networks;
}

interface SignRequestBody {
  id: string;
  signedMessage: string;
}

interface SubmitRequestBody {
  id: string;
  transactionHash: string;
}


export const post = catchAsync(async (req, res) => {
  const params = req.body as PostRequestBody;
  const response = await GuardianService.create(params.walletAddress, params.socialRecoveryAddress, params.oldOwner, params.newOwner, params.dataHash, params.network);

  res.send(response);
});

export const submit = catchAsync(async (req, res) => {
  const { id, transactionHash } = req.body as SubmitRequestBody;

  await GuardianService.submit(
    id, transactionHash
  );

  res.send({success:true});
});

export const sign = catchAsync(async (req, res) => {
  const { id, signedMessage } = req.body as SignRequestBody;

  await GuardianService.signDataHash(
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
    const object = {...requestJSON, signaturesAcquired: requestJSON.signatures.length};
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
  const object = {...requestJSON, signaturesAcquired: requestJSON.signatures.length};

  res.send(object);
});
