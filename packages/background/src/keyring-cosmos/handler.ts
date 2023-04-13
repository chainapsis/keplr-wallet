import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetCosmosKeyMsg,
  GetCosmosKeysSettledMsg,
  RequestCosmosSignAminoMsg,
  RequestCosmosSignAminoADR36Msg,
  VerifyCosmosSignAminoADR36Msg,
  ComputeNotFinalizedMnemonicKeyAddressesMsg,
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
} from "./messages";
import { KeyRingCosmosService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: KeyRingCosmosService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetCosmosKeyMsg:
        return handleGetCosmosKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetCosmosKeyMsg
        );
      case GetCosmosKeysSettledMsg:
        return handleGetCosmosKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetCosmosKeysSettledMsg);
      case RequestCosmosSignAminoMsg:
        return handleRequestCosmosSignAminoMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestCosmosSignAminoMsg);
      case RequestCosmosSignAminoADR36Msg:
        return handleRequestCosmosSignAminoADR36Msg(
          service,
          permissionInteractionService
        )(env, msg as RequestCosmosSignAminoADR36Msg);
      case VerifyCosmosSignAminoADR36Msg:
        return handleVerifyCosmosSignAminoADR36Msg(
          service,
          permissionInteractionService
        )(env, msg as VerifyCosmosSignAminoADR36Msg);
      case ComputeNotFinalizedMnemonicKeyAddressesMsg:
        return handleComputeNotFinalizedMnemonicKeyAddressesMsg(service)(
          env,
          msg as ComputeNotFinalizedMnemonicKeyAddressesMsg
        );
      case PrivilegeCosmosSignAminoWithdrawRewardsMsg:
        return handlePrivilegeCosmosSignAminoWithdrawRewardsMsg(service)(
          env,
          msg as PrivilegeCosmosSignAminoWithdrawRewardsMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetCosmosKeyMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetCosmosKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.getKeySelected(env, msg.chainId);
  };
};

const handleGetCosmosKeysSettledMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetCosmosKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      msg.chainIds,
      msg.origin
    );

    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getKeySelected(env, chainId))
    );
  };
};

const handleRequestCosmosSignAminoMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestCosmosSignAminoMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.signAminoSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc,
      msg.signOptions
    );
  };
};

const handleRequestCosmosSignAminoADR36Msg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestCosmosSignAminoADR36Msg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return (
      await service.signAminoADR36Selected(
        env,
        msg.origin,
        msg.chainId,
        msg.signer,
        msg.data,
        msg.signOptions
      )
    ).signature;
  };
};

const handleVerifyCosmosSignAminoADR36Msg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<VerifyCosmosSignAminoADR36Msg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.verifyAminoADR36Selected(
      env,
      msg.chainId,
      msg.signer,
      msg.data,
      msg.signature
    );
  };
};

const handleComputeNotFinalizedMnemonicKeyAddressesMsg: (
  service: KeyRingCosmosService
) => InternalHandler<ComputeNotFinalizedMnemonicKeyAddressesMsg> = (
  service
) => {
  return async (env, msg) => {
    return await service.computeNotFinalizedMnemonicKeyAddresses(
      env,
      msg.id,
      msg.chainId
    );
  };
};

const handlePrivilegeCosmosSignAminoWithdrawRewardsMsg: (
  service: KeyRingCosmosService
) => InternalHandler<PrivilegeCosmosSignAminoWithdrawRewardsMsg> = (
  service
) => {
  return async (env, msg) => {
    return await service.privilegeSignAminoWithdrawRewards(
      env,
      msg.chainId,
      msg.signer,
      msg.signDoc
    );
  };
};
