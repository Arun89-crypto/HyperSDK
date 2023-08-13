import { TransactionResult } from "../enum/TransactionResult";

export interface SwapResult {
  result: TransactionResult;
  TransactionHash?: string;
  TransactionData?: string;
}
