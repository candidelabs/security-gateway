import httpStatus from "http-status";
import { catchAsync, ApiError } from "../utils";
import * as GuardianService from "../services/guardian.service";
import {Networks} from "../config/network";

interface PostRequestBody {
  accountAddress: string;
  newOwner: string;
  network: Networks;
}

interface SignRequestBody {
  id: string;
  signer: string;
  signedMessage: string;
}

interface SubmitRequestBody {
  id: string;
  transactionHash: string;
}


export const post = catchAsync(async (req, res) => {
  const params = req.body as PostRequestBody;
  const response = await GuardianService.create(
    params.accountAddress,
    params.newOwner,
    params.network
  );

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
  const { id, signer, signedMessage } = req.body as SignRequestBody;

  await GuardianService.signRecoveryHash(
    id, signer, signedMessage
  );

  res.send({success:true});
});

export const fetchByAddress = catchAsync(async (req, res) => {
  const { accountAddress, network, nonce } = req.query as unknown as {
    accountAddress: string;
    network: Networks;
    nonce: number;
  };

  const accountRequests = await GuardianService.findByAccountAddress(
    accountAddress,
    network,
    nonce,
  );
  const responses = [];
  for (const request of accountRequests){
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


export const finalize = catchAsync(async (req, res) => {
  const { id } = req.body as {
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

  const transactionHash = await GuardianService.finalize(request);

  res.send({success:true, transactionHash});
});
