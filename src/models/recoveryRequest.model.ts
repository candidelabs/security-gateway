import { Schema, model, Document } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import {Networks} from "../config/network";
import {IUserOperation} from "testing-wallet-helper-functions/lib/constants/userOperations";

type IStatus = "PENDING" | "SUCCESS" | "FAIL";

export interface IRecoveryRequest extends Document {
  emoji: string;
  walletAddress: string;
  socialRecoveryAddress: string;
  oldOwner: string;
  newOwner: string;
  network: Networks;
  status: IStatus;
  dataHash: string;
  signers: Array<string>;
  signatures: Array<string>;
  transactionHash: string;
  readyToSubmit: boolean;
  discoverable: boolean;
}

const schema = new Schema<IRecoveryRequest>(
  {
    emoji: { type: String, required: true },
    walletAddress: { type: String, required: true },
    socialRecoveryAddress: { type: String, required: true },
    oldOwner: { type: String, required: true },
    newOwner: { type: String, required: true },
    network: { type: String, required: true },
    dataHash: { type: String, required: true },
    signers: [{ type: String, required: true }],
    signatures: [{ type: String, required: true }],
    transactionHash: { type: String, required: false, default: "" },
    status: { type: String, required: true },
    readyToSubmit: { type: Boolean, default: false },
    discoverable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("RecoveryRequest", schema);
