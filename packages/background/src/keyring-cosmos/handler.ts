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
  RequestCosmosSignDirectMsg,
  RequestCosmosSignAminoADR36Msg,
  VerifyCosmosSignAminoADR36Msg,
  ComputeNotFinalizedKeyAddressesMsg,
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  GetCosmosKeysForEachVaultSettledMsg,
  RequestSignEIP712CosmosTxMsg_v0,
  RequestICNSAdr36SignaturesMsg,
  EnableVaultsWithCosmosAddressMsg,
  PrivilegeCosmosSignAminoDelegateMsg,
  RequestCosmosSignDirectAuxMsg,
  GetCosmosKeysForEachVaultWithSearchSettledMsg,
  PrivilegeCosmosSignAminoExecuteCosmWasmMsg,
} from "./messages";
import { KeyRingCosmosService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";
import {
  SignDoc,
  SignDocDirectAux,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

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
      case RequestCosmosSignDirectMsg:
        return handleRequestCosmosSignDirectMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestCosmosSignDirectMsg);
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
      case ComputeNotFinalizedKeyAddressesMsg:
        return handleComputeNotFinalizedKeyAddressesMsg(service)(
          env,
          msg as ComputeNotFinalizedKeyAddressesMsg
        );
      case PrivilegeCosmosSignAminoWithdrawRewardsMsg:
        return handlePrivilegeCosmosSignAminoWithdrawRewardsMsg(service)(
          env,
          msg as PrivilegeCosmosSignAminoWithdrawRewardsMsg
        );
      case PrivilegeCosmosSignAminoDelegateMsg:
        return handlePrivilegeCosmosSignAminoDelegateMsg(service)(
          env,
          msg as PrivilegeCosmosSignAminoDelegateMsg
        );
      case GetCosmosKeysForEachVaultSettledMsg:
        return handleGetCosmosKeysForEachVaultSettledMsg(service)(
          env,
          msg as GetCosmosKeysForEachVaultSettledMsg
        );
      case GetCosmosKeysForEachVaultWithSearchSettledMsg:
        return handleGetCosmosKeysForEachVaultWithSearchSettledMsg(service)(
          env,
          msg as GetCosmosKeysForEachVaultWithSearchSettledMsg
        );
      case RequestSignEIP712CosmosTxMsg_v0:
        return handleRequestSignEIP712CosmosTxMsg_v0(
          service,
          permissionInteractionService
        )(env, msg as RequestSignEIP712CosmosTxMsg_v0);
      case RequestICNSAdr36SignaturesMsg:
        return handleRequestICNSAdr36SignaturesMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestICNSAdr36SignaturesMsg);
      case EnableVaultsWithCosmosAddressMsg:
        return handleEnableVaultsWithCosmosAddressMsg(service)(
          env,
          msg as EnableVaultsWithCosmosAddressMsg
        );
      case RequestCosmosSignDirectAuxMsg:
        return handleRequestCosmosSignDirectAuxMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestCosmosSignDirectAuxMsg);
      case PrivilegeCosmosSignAminoExecuteCosmWasmMsg:
        return handlePrivilegeCosmosSignAminoExecuteCosmWasmMsg(service)(
          env,
          msg as PrivilegeCosmosSignAminoExecuteCosmWasmMsg
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

    return await service.getKeySelected(msg.chainId);
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
      msg.chainIds.map((chainId) => service.getKeySelected(chainId))
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

const handleRequestCosmosSignDirectMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestCosmosSignDirectMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    const signDoc = SignDoc.fromPartial({
      bodyBytes: msg.signDoc.bodyBytes,
      authInfoBytes: msg.signDoc.authInfoBytes,
      chainId: msg.signDoc.chainId,
      accountNumber: msg.signDoc.accountNumber,
    });

    const response = await service.signDirectSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      signDoc,
      msg.signOptions
    );

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: response.signed.accountNumber.toString(),
      },
      signature: response.signature,
    };
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
      msg.chainId,
      msg.signer,
      msg.data,
      msg.signature
    );
  };
};

const handleComputeNotFinalizedKeyAddressesMsg: (
  service: KeyRingCosmosService
) => InternalHandler<ComputeNotFinalizedKeyAddressesMsg> = (service) => {
  return async (_, msg) => {
    return await service.computeNotFinalizedKeyAddresses(msg.id, msg.chainId);
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
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc
    );
  };
};

const handlePrivilegeCosmosSignAminoDelegateMsg: (
  service: KeyRingCosmosService
) => InternalHandler<PrivilegeCosmosSignAminoDelegateMsg> = (service) => {
  return async (env, msg) => {
    return await service.privilegeSignAminoDelegate(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc
    );
  };
};

const handlePrivilegeCosmosSignAminoExecuteCosmWasmMsg: (
  service: KeyRingCosmosService
) => InternalHandler<PrivilegeCosmosSignAminoExecuteCosmWasmMsg> = (
  service
) => {
  return async (env, msg) => {
    return await service.privilegeSignAminoExecuteCosmWasm(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc
    );
  };
};

const handleGetCosmosKeysForEachVaultSettledMsg: (
  service: KeyRingCosmosService
) => InternalHandler<GetCosmosKeysForEachVaultSettledMsg> = (service) => {
  return async (_, msg) => {
    return await Promise.allSettled(
      msg.vaultIds.map((vaultId) =>
        (async () => {
          const key = await service.getKey(vaultId, msg.chainId);
          return {
            vaultId,
            ...key,
          };
        })()
      )
    );
  };
};

const handleGetCosmosKeysForEachVaultWithSearchSettledMsg: (
  service: KeyRingCosmosService
) => InternalHandler<GetCosmosKeysForEachVaultWithSearchSettledMsg> = (
  service
) => {
  return async (_, msg) => {
    const searched = service.keyRingService.searchKeyRings(
      msg.searchText,
      true
    );

    const searchedMap = new Map<string, boolean>();
    for (const s of searched) {
      searchedMap.set(s.id, true);
    }

    const vaultIds = msg.vaultIds.filter((vaultId) => searchedMap.has(vaultId));

    return await Promise.allSettled(
      vaultIds.map((vaultId) =>
        (async () => {
          const key = await service.getKey(vaultId, msg.chainId);
          return {
            vaultId,
            ...key,
          };
        })()
      )
    );
  };
};

const handleRequestSignEIP712CosmosTxMsg_v0: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignEIP712CosmosTxMsg_v0> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestSignEIP712CosmosTx_v0_selected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.eip712,
      msg.signDoc,
      msg.signOptions
    );
  };
};

const handleRequestICNSAdr36SignaturesMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestICNSAdr36SignaturesMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.requestICNSAdr36SignaturesSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.contractAddress,
      msg.owner,
      msg.username,
      msg.addressChainIds
    );
  };
};

const handleEnableVaultsWithCosmosAddressMsg: (
  service: KeyRingCosmosService
) => InternalHandler<EnableVaultsWithCosmosAddressMsg> = (service) => {
  return async (_, msg) => {
    return await service.enableVaultsWithCosmosAddress(
      msg.chainId,
      msg.bech32Address
    );
  };
};

const handleRequestCosmosSignDirectAuxMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestCosmosSignDirectAuxMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    const signDoc = SignDocDirectAux.fromPartial({
      bodyBytes: msg.signDoc.bodyBytes,
      publicKey: msg.signDoc.publicKey,
      chainId: msg.signDoc.chainId,
      accountNumber: msg.signDoc.accountNumber,
      sequence: msg.signDoc.sequence,
    });

    const response = await service.signDirectAuxSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      signDoc,
      msg.signOptions
    );

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        publicKey: response.signed.publicKey,
        chainId: response.signed.chainId,
        accountNumber: response.signed.accountNumber.toString(),
        sequence: response.signed.sequence.toString(),
      },
      signature: response.signature,
    };
  };
};
