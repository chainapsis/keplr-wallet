import { toHex } from "@cosmjs/encoding";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export const getWalletKeys = async (mnemonic: string) => {
  const wallet: any = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
  return {
    privateKey: toHex(wallet?.privkey),
    publicKey: toHex(wallet?.pubkey),
  };
};
