import {
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";

import { Env } from "@keplr-wallet/router";
import { KeyRingBitcoinService } from "./service";
import { PermissionInteractiveService } from "src/permission-interactive";
import {
  GetBitcoinKeyMsg,
  GetBitcoinKeysForEachVaultSettledMsg,
  GetBitcoinKeysSettledMsg,
  GetSupportedPaymentTypesMsg,
  RequestBitcoinDisconnectMsg,
  RequestBitcoinGetAccountsMsg,
  RequestBitcoinGetChainMsg,
  RequestBitcoinGetNetworkMsg,
  RequestBitcoinRequestAccountsMsg,
  RequestBitcoinSwitchNetworkMsg,
  RequestSignBitcoinMessageMsg,
  RequestSignBitcoinPsbtMsg,
  RequestSignBitcoinPsbtsMsg,
  RequestBitcoinSwitchChainMsg,
  RequestBitcoinGetPublicKeyMsg,
  RequestBitcoinGetBalanceMsg,
  RequestBitcoinGetInscriptionsMsg,
  RequestBitcoinSendBitcoinMsg,
  RequestBitcoinPushTxMsg,
} from "./messages";

export const getHandler: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  _service: KeyRingBitcoinService,
  _permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetBitcoinKeyMsg:
        return handleGetBitcoinKeyMsg(_service, _permissionInteractionService)(
          env,
          msg as GetBitcoinKeyMsg
        );
      case GetBitcoinKeysSettledMsg:
        return handleGetBitcoinKeysSettledMsg(
          _service,
          _permissionInteractionService
        )(env, msg as GetBitcoinKeysSettledMsg);
      case GetBitcoinKeysForEachVaultSettledMsg:
        return handleGetBitcoinKeysForEachVaultSettledMsg(_service)(
          env,
          msg as GetBitcoinKeysForEachVaultSettledMsg
        );
      case RequestSignBitcoinPsbtMsg:
        return handleRequestSignBitcoinPsbtMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinPsbtMsg);
      case RequestSignBitcoinPsbtsMsg:
        return handleRequestSignBitcoinPsbtsMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinPsbtsMsg);
      case RequestSignBitcoinMessageMsg:
        return handleRequestSignBitcoinMessageMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinMessageMsg);
      case GetSupportedPaymentTypesMsg:
        return handleGetSupportedPaymentTypesMsg(_service)(
          env,
          msg as GetSupportedPaymentTypesMsg
        );
      case RequestBitcoinGetAccountsMsg:
        return handleRequestBitcoinGetAccountsMsg(_service)(
          env,
          msg as RequestBitcoinGetAccountsMsg
        );
      case RequestBitcoinRequestAccountsMsg:
        return handleRequestBitcoinRequestAccountsMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinRequestAccountsMsg);
      case RequestBitcoinDisconnectMsg:
        return handleRequestBitcoinDisconnectMsg(_service)(
          env,
          msg as RequestBitcoinDisconnectMsg
        );
      case RequestBitcoinGetNetworkMsg:
        return handleRequestBitcoinGetNetworkMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinGetNetworkMsg);
      case RequestBitcoinSwitchNetworkMsg:
        return handleRequestBitcoinSwitchNetworkMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinSwitchNetworkMsg);
      case RequestBitcoinGetChainMsg:
        return handleRequestBitcoinGetChainMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinGetChainMsg);
      case RequestBitcoinSwitchChainMsg:
        return handleRequestBitcoinSwitchChainMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinSwitchChainMsg);
      case RequestBitcoinGetPublicKeyMsg:
        return handleRequestBitcoinGetPublicKeyMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinGetPublicKeyMsg);
      case RequestBitcoinGetBalanceMsg:
        return handleRequestBitcoinGetBalanceMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinGetBalanceMsg);
      case RequestBitcoinGetInscriptionsMsg:
        return handleRequestBitcoinGetInscriptionsMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinGetInscriptionsMsg);
      case RequestBitcoinSendBitcoinMsg:
        return handleRequestBitcoinSendBitcoinMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinSendBitcoinMsg);
      case RequestBitcoinPushTxMsg:
        return handleRequestBitcoinPushTxMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestBitcoinPushTxMsg);
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetBitcoinKeyMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.getBitcoinKeySelected(msg.chainId);
  };
};

const handleGetBitcoinKeysSettledMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getBitcoinKeySelected(chainId))
    );
  };
};

const handleGetBitcoinKeysForEachVaultSettledMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<GetBitcoinKeysForEachVaultSettledMsg> = (service) => {
  return async (_, msg) => {
    return await Promise.allSettled(
      msg.vaultIds.map((vaultId) =>
        (async () => {
          const key = await service.getBitcoinKey(vaultId, msg.chainId);
          return {
            vaultId,
            ...key,
          };
        })()
      )
    );
  };
};

const handleRequestSignBitcoinPsbtMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    const chainId = msg.chainId || service.forceGetCurrentChainId(msg.origin);
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signPsbtSelected(
      env,
      msg.origin,
      chainId,
      msg.psbtHex,
      msg.options
    );
  };
};

const handleRequestSignBitcoinPsbtsMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtsMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    const chainId = msg.chainId || service.forceGetCurrentChainId(msg.origin);
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signPsbtsSelected(
      env,
      msg.origin,
      chainId,
      msg.psbtsHexes,
      msg.options
    );
  };
};

const handleRequestSignBitcoinMessageMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinMessageMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    const chainId = msg.chainId || service.forceGetCurrentChainId(msg.origin);
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signMessageSelected(
      env,
      msg.origin,
      chainId,
      msg.message,
      msg.signType
    );
  };
};

const handleGetSupportedPaymentTypesMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<GetSupportedPaymentTypesMsg> = (service) => {
  return async (_) => {
    return service.getSupportedPaymentTypes();
  };
};

const handleRequestBitcoinGetAccountsMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<RequestBitcoinGetAccountsMsg> = (service) => {
  return async (_, msg) => {
    return await service.getAccounts(msg.origin);
  };
};

const handleRequestBitcoinRequestAccountsMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinRequestAccountsMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.requestAccounts(msg.origin);
  };
};

const handleRequestBitcoinDisconnectMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<RequestBitcoinDisconnectMsg> = (service) => {
  return async (_, msg) => {
    return await service.disconnect(msg.origin);
  };
};

const handleRequestBitcoinGetNetworkMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinGetNetworkMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return service.getNetwork(msg.origin);
  };
};

const handleRequestBitcoinSwitchNetworkMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinSwitchNetworkMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    const newCurrentChainId = service.getNewCurrentChainIdFromNetwork(
      msg.network
    );
    await permissionInteractionService.ensureEnabledForBitcoin(
      env,
      msg.origin,
      newCurrentChainId
    );

    return await service.switchNetwork(env, msg.origin, msg.network);
  };
};

const handleRequestBitcoinGetChainMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinGetChainMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return service.getChain(msg.origin);
  };
};

const handleRequestBitcoinSwitchChainMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinSwitchChainMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    const newCurrentChainId = service.getNewCurrentChainIdFromChainType(
      msg.chainType
    );
    await permissionInteractionService.ensureEnabledForBitcoin(
      env,
      msg.origin,
      newCurrentChainId
    );

    return await service.switchChain(env, msg.origin, msg.chainType);
  };
};

const handleRequestBitcoinGetPublicKeyMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinGetPublicKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.getPublicKey(msg.origin);
  };
};

const handleRequestBitcoinGetBalanceMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinGetBalanceMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.getBalance(msg.origin);
  };
};

const handleRequestBitcoinGetInscriptionsMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinGetInscriptionsMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.getInscriptions();
  };
};

const handleRequestBitcoinSendBitcoinMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinSendBitcoinMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.sendBitcoin(env, msg.origin, msg.to, msg.amount);
  };
};

const handleRequestBitcoinPushTxMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestBitcoinPushTxMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.pushTx(msg.origin, msg.rawTxHex);
  };
};
