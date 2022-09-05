import { Schema, model, Document } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import {Networks} from "../config/network";
import {IUserOperation} from "testing-wallet-helper-functions/lib/constants/userOperations";

type IStatus = "PENDING" | "SUCCESS" | "FAIL";

export interface IRecoveryRequest extends Document {
  emoji: string;
  walletAddress: string;
  newOwner: string;
  network: Networks;
  status: IStatus;
  userOperation: IUserOperation;
  signers: Array<string>;
  signatures: Array<string>;
  discoverable: boolean;
}

const schema = new Schema<IRecoveryRequest>(
  {
    emoji: { type: String, required: true },
    walletAddress: { type: String, required: true },
    newOwner: { type: String, required: true },
    network: { type: String, required: true },
    userOperation: { type: Map, required: true },
    signers: [{ type: String, required: true }],
    signatures: [{ type: String, required: true }],
    status: { type: String, required: true },
    discoverable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("RecoveryRequest", schema);
