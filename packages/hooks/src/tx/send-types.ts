import { IAccountStore, MsgOpt } from "@keplr-wallet/stores";

export type AccountStore = IAccountStore<{
  cosmos?: {
    readonly msgOpts: {
      readonly send: {
        readonly native: MsgOpt;
      };
    };
  };
  cosmwasm?: {
    readonly msgOpts: {
      readonly send: {
        readonly cw20: Pick<MsgOpt, "gas">;
      };
    };
  };
  secret?: {
    readonly msgOpts: {
      readonly send: {
        readonly secret20: Pick<MsgOpt, "gas">;
      };
    };
  };
}>;
