import { Schema, model, Document } from "mongoose";
// @ts-ignore
import toJSON from "@meanie/mongoose-to-json";
import {Networks} from "../config/network";

type IStatus = "PENDING" | "EXECUTED" | "FINALIZED" | 'FINALIZATION-IN-PROGRESS' | "FAILED";

export interface IRecoveryRequest extends Document {
  emoji: string;
  accountAddress: string;
  newOwner: string;
  nonce: number;
  network: Networks;
  status: IStatus;
  signatures: Array<Array<string>>;
  executeTransactionHash: string;
  finalizeTransactionHash: string;
  discoverable: boolean;
}

const schema = new Schema<IRecoveryRequest>(
  {
    emoji: { type: String, required: true },
    accountAddress: { type: String, required: true },
    network: { type: String, required: true },
    newOwner: { type: String, required: true },
    nonce: { type: Number, required: true },
    signatures: [[{ type: String, required: true }]],
    executeTransactionHash: { type: String, required: false, default: "" },
    finalizeTransactionHash: { type: String, required: false, default: "" },
    status: { type: String, required: true },
    discoverable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("RecoveryRequest", schema);
