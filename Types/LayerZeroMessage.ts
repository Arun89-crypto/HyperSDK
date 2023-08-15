import { MessageStatus } from "../enum/MessageStatus";

export type Message = {
  srcUaAddress: string;
  dstUaAddress: string;
  srcChainId: number;
  dstChainId: number;
  dstTxHash?: string;
  dstTxError?: string;
  srcTxHash: string;
  srcBlockHash: string;
  srcBlockNumber: string;
  srcUaNonce: number;
  status: MessageStatus;
};
