import * as $protobuf from "protobufjs";
import {
  MsgProvision,
  MsgWalletSpendAction,
} from "@keplr-wallet/proto-types/agoric/swingset/msgs";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import {
  MsgMultiSend,
  MsgSend,
} from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
  MsgUnbondValidator,
  MsgCancelUnbondingDelegation,
  MsgTokenizeShares,
  MsgRedeemTokensForShares,
  MsgTransferTokenizeShareRecord,
  MsgDisableTokenizeShares,
  MsgEnableTokenizeShares,
  MsgValidatorBond,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  MsgExec,
  MsgGrant,
  MsgRevoke,
} from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
} from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
} from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import {
  MsgPayPacketFee,
  MsgPayPacketFeeAsync,
  MsgRegisterPayee,
  MsgRegisterCounterpartyPayee,
} from "@keplr-wallet/proto-types/ibc/applications/fee/v1/tx";
import { UnknownMessage } from "./unknown";
import { GenericAuthorization } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/authz";
import { StakeAuthorization } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/authz";
import { SendAuthorization } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/authz";
import {
  MsgLiquidStake,
  MsgLSMLiquidStake,
  MsgRedeemStake,
  MsgRegisterHostZone,
  MsgClaimUndelegatedTokens,
  MsgRebalanceValidators,
  MsgAddValidators,
  MsgChangeValidatorWeight,
  MsgDeleteValidator,
  MsgRestoreInterchainAccount,
  MsgUpdateValidatorSharesExchRate,
  MsgCalibrateDelegation,
  MsgClearBalance,
  MsgUndelegateHost,
  MsgUpdateInnerRedemptionRateBounds,
} from "@keplr-wallet/proto-types/stride/stakeibc/tx";
import {
  MsgLiquidStake as MsgLiquidStakeStakeTia,
  MsgRedeemStake as MsgRedeemStakeStakeTia,
  MsgConfirmDelegation,
  MsgConfirmUndelegation,
  MsgConfirmUnbondedTokenSweep,
  MsgAdjustDelegatedBalance,
  MsgUpdateInnerRedemptionRateBounds as MsgUpdateInnerRedemptionRateBoundsStakeTia,
  MsgResumeHostZone,
  MsgRefreshRedemptionRate,
  MsgOverwriteDelegationRecord,
  MsgOverwriteUnbondingRecord,
  MsgOverwriteRedemptionRecord,
  MsgSetOperatorAddress,
} from "@keplr-wallet/proto-types/stride/staketia/tx";
import {
  MsgLiquidStake as MsgLiquidStakeStakeDym,
  MsgRedeemStake as MsgRedeemStakeStakeDym,
  MsgConfirmDelegation as MsgConfirmDelegationStakeDym,
  MsgConfirmUndelegation as MsgConfirmUndelegationStakeDym,
  MsgConfirmUnbondedTokenSweep as MsgConfirmUnbondedTokenSweepStakeDym,
  MsgAdjustDelegatedBalance as MsgAdjustDelegatedBalanceStakeDym,
  MsgUpdateInnerRedemptionRateBounds as MsgUpdateInnerRedemptionRateBoundsStakeDym,
  MsgResumeHostZone as MsgResumeHostZoneStakeDym,
  MsgRefreshRedemptionRate as MsgRefreshRedemptionRateStakeDym,
  MsgOverwriteDelegationRecord as MsgOverwriteDelegationRecordStakeDym,
  MsgOverwriteUnbondingRecord as MsgOverwriteUnbondingRecordStakeDym,
  MsgOverwriteRedemptionRecord as MsgOverwriteRedemptionRecordStakeDym,
  MsgSetOperatorAddress as MsgSetOperatorAddressStakeDym,
} from "@keplr-wallet/proto-types/stride/stakedym/tx";
import { Buffer } from "buffer/";

export * from "./unknown";

export type AnyWithUnpacked = Any | (Any & { unpacked: unknown });

interface ProtoFactory {
  encode: (message: any, writer?: $protobuf.Writer) => $protobuf.Writer;
  decode: (r: $protobuf.Reader | Uint8Array, l?: number) => any;
  fromJSON: (object: any) => any;
  toJSON: (message: any) => unknown;
}

export class ProtoCodec {
  protected typeUrlMap: Map<string, ProtoFactory> = new Map();

  unpackAnyFactory(typeUrl: string): ProtoFactory | undefined {
    if (!this.typeUrlMap.has(typeUrl)) {
      return undefined;
    }

    return this.typeUrlMap.get(typeUrl);
  }

  /**
   * Unpack the any to the registered message.
   * NOTE: If there is no matched message, it will not throw an error but return the `UnknownMessage` class.
   * @param any
   */
  unpackAny(any: Any): AnyWithUnpacked {
    const factory = this.unpackAnyFactory(any.typeUrl);
    if (!factory) {
      return new UnknownMessage(any.typeUrl, any.value);
    }

    const unpacked = factory.decode(any.value);

    return {
      ...any,
      unpacked,
    };
  }

  unpackedAnyToJSONRecursive(unpacked: AnyWithUnpacked): unknown {
    if (unpacked instanceof UnknownMessage) {
      return unpacked.toJSON();
    }

    const factory = this.unpackAnyFactory(unpacked.typeUrl);
    if (factory && "unpacked" in unpacked && unpacked.unpacked) {
      const isJSONEncodedAny = (
        any: any
      ): any is {
        typeUrl: string;
        value: string;
      } => {
        const r =
          typeof any === "object" &&
          !(any instanceof UnknownMessage) &&
          "typeUrl" in any &&
          any.typeUrl &&
          typeof any.typeUrl === "string" &&
          "value" in any &&
          any.value &&
          typeof any.value === "string";

        if (r) {
          try {
            Buffer.from(any.value, "base64");
          } catch {
            return false;
          }
        }

        return r;
      };

      const unpackJSONEncodedAnyInner = (jsonEncodedAny: {
        typeUrl: string;
        value: string;
      }): {
        typeUrl: string;
        value: unknown;
      } => {
        const factory = this.unpackAnyFactory(jsonEncodedAny.typeUrl);

        const bz = Buffer.from(jsonEncodedAny.value, "base64");

        if (!factory) {
          return new UnknownMessage(jsonEncodedAny.typeUrl, bz).toJSON();
        }

        const unpacked = factory.decode(bz);
        return {
          typeUrl: jsonEncodedAny.typeUrl,
          value: factory.toJSON(unpacked),
        };
      };

      const unpackedJSONEncodedAnyRecursive = (obj: object): object => {
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const value = obj[i];
            if (isJSONEncodedAny(value)) {
              obj[i] = unpackJSONEncodedAnyInner(value);
            } else if (typeof value === "object") {
              obj[i] = unpackedJSONEncodedAnyRecursive(value);
            }
          }
        } else {
          for (const key in obj) {
            const value = (obj as any)[key];
            if (isJSONEncodedAny(value)) {
              (obj as any)[key] = unpackJSONEncodedAnyInner(value);
            } else if (typeof value === "object") {
              (obj as any)[key] = unpackedJSONEncodedAnyRecursive(value);
            }
          }
        }
        return obj;
      };

      // This is mutated by logic.
      let mutObj = factory.toJSON(unpacked.unpacked);
      if (mutObj && typeof mutObj === "object") {
        mutObj = unpackedJSONEncodedAnyRecursive(mutObj);
        return {
          typeUrl: unpacked.typeUrl,
          value: mutObj,
        };
      }
    }

    return new UnknownMessage(unpacked.typeUrl, unpacked.value).toJSON();
  }

  registerAny(typeUrl: string, message: ProtoFactory): void {
    this.typeUrlMap.set(typeUrl, message);
  }
}

export const defaultProtoCodec = new ProtoCodec();
defaultProtoCodec.registerAny(
  "/agoric.swingset.MsgWalletSpendAction",
  MsgWalletSpendAction
);
defaultProtoCodec.registerAny("/agoric.swingset.MsgProvision", MsgProvision);
defaultProtoCodec.registerAny("/cosmos.bank.v1beta1.MsgSend", MsgSend);
defaultProtoCodec.registerAny(
  "/cosmos.bank.v1beta1.MsgMultiSend",
  MsgMultiSend
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgDelegate",
  MsgDelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgUndelegate",
  MsgUndelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  MsgBeginRedelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgUnbondValidator",
  MsgUnbondValidator
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation",
  MsgCancelUnbondingDelegation
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgTokenizeShares",
  MsgTokenizeShares
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgRedeemTokensForShares",
  MsgRedeemTokensForShares
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgTransferTokenizeShareRecord",
  MsgTransferTokenizeShareRecord
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgDisableTokenizeShares",
  MsgDisableTokenizeShares
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgEnableTokenizeShares",
  MsgEnableTokenizeShares
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgValidatorBond",
  MsgValidatorBond
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgExecuteContract",
  MsgExecuteContract
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgInstantiateContract",
  MsgInstantiateContract
);
defaultProtoCodec.registerAny(
  "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  MsgWithdrawDelegatorReward
);
defaultProtoCodec.registerAny(
  "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  MsgSetWithdrawAddress
);
defaultProtoCodec.registerAny(
  "/ibc.applications.transfer.v1.MsgTransfer",
  MsgTransfer
);
defaultProtoCodec.registerAny(
  "/ibc.applications.fee.v1.MsgPayPacketFee",
  MsgPayPacketFee
);
defaultProtoCodec.registerAny(
  "/ibc.applications.fee.v1.MsgPayPacketFeeAsync",
  MsgPayPacketFeeAsync
);
defaultProtoCodec.registerAny(
  "/ibc.applications.fee.v1.MsgRegisterPayee",
  MsgRegisterPayee
);
defaultProtoCodec.registerAny(
  "/ibc.applications.fee.v1.MsgRegisterCounterpartyPayee",
  MsgRegisterCounterpartyPayee
);
defaultProtoCodec.registerAny("/cosmos.gov.v1beta1.MsgVote", MsgVote);
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgGrant", MsgGrant);
// ----- Authz grants -----
defaultProtoCodec.registerAny(
  "/cosmos.authz.v1beta1.GenericAuthorization",
  GenericAuthorization
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.StakeAuthorization",
  StakeAuthorization
);
defaultProtoCodec.registerAny(
  "/cosmos.bank.v1beta1.SendAuthorization",
  SendAuthorization
);
// ----- Authz grants -----
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke);
defaultProtoCodec.registerAny("/cosmos.authz.v1beta1.MsgExec", MsgExec);

// Stride
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgLiquidStake",
  MsgLiquidStake
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgLSMLiquidStake",
  MsgLSMLiquidStake
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgRedeemStake",
  MsgRedeemStake
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgRegisterHostZone",
  MsgRegisterHostZone
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgClaimUndelegatedTokens",
  MsgClaimUndelegatedTokens
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgRebalanceValidators",
  MsgRebalanceValidators
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgAddValidators",
  MsgAddValidators
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgChangeValidatorWeight",
  MsgChangeValidatorWeight
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgDeleteValidator",
  MsgDeleteValidator
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgRestoreInterchainAccount",
  MsgRestoreInterchainAccount
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgUpdateValidatorSharesExchRate",
  MsgUpdateValidatorSharesExchRate
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgCalibrateDelegation",
  MsgCalibrateDelegation
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgClearBalance",
  MsgClearBalance
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgUndelegateHost",
  MsgUndelegateHost
);
defaultProtoCodec.registerAny(
  "/stride.stakeibc.MsgUpdateInnerRedemptionRateBounds",
  MsgUpdateInnerRedemptionRateBounds
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgLiquidStake",
  MsgLiquidStakeStakeTia
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgRedeemStake",
  MsgRedeemStakeStakeTia
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgConfirmDelegation",
  MsgConfirmDelegation
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgConfirmUndelegation",
  MsgConfirmUndelegation
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgConfirmUnbondedTokenSweep",
  MsgConfirmUnbondedTokenSweep
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgAdjustDelegatedBalance",
  MsgAdjustDelegatedBalance
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgUpdateInnerRedemptionRateBounds",
  MsgUpdateInnerRedemptionRateBoundsStakeTia
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgResumeHostZone",
  MsgResumeHostZone
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgRefreshRedemptionRate",
  MsgRefreshRedemptionRate
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgOverwriteDelegationRecord",
  MsgOverwriteDelegationRecord
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgOverwriteUnbondingRecord",
  MsgOverwriteUnbondingRecord
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgOverwriteRedemptionRecord",
  MsgOverwriteRedemptionRecord
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgOverwriteRedemptionRecord",
  MsgOverwriteRedemptionRecord
);
defaultProtoCodec.registerAny(
  "/stride.staketia.MsgSetOperatorAddress",
  MsgSetOperatorAddress
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgLiquidStake",
  MsgLiquidStakeStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgRedeemStake",
  MsgRedeemStakeStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgConfirmDelegation",
  MsgConfirmDelegationStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgConfirmUndelegation",
  MsgConfirmUndelegationStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgConfirmUnbondedTokenSweep",
  MsgConfirmUnbondedTokenSweepStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgAdjustDelegatedBalance",
  MsgAdjustDelegatedBalanceStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgUpdateInnerRedemptionRateBounds",
  MsgUpdateInnerRedemptionRateBoundsStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgResumeHostZone",
  MsgResumeHostZoneStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgRefreshRedemptionRate",
  MsgRefreshRedemptionRateStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgOverwriteDelegationRecord",
  MsgOverwriteDelegationRecordStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgOverwriteUnbondingRecord",
  MsgOverwriteUnbondingRecordStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgOverwriteRedemptionRecord",
  MsgOverwriteRedemptionRecordStakeDym
);
defaultProtoCodec.registerAny(
  "/stride.stakedym.MsgSetOperatorAddress",
  MsgSetOperatorAddressStakeDym
);
