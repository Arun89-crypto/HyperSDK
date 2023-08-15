import { Signer } from "ethers";

export interface MainConfig {
  rpc_url_1: string;
  rpc_url_2: string;
  signer1: Signer;
  signer2: Signer;
  name_1: "OPTIMISM" | "BASE";
  name_2: "OPTIMISM" | "BASE";
}
