import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { TokenCW20Service } from "./service";
import {
  GetAllTokenInfosMsg,
  AddTokenMsg,
  GetSecret20ViewingKey,
  RemoveTokenMsg,
  SuggestTokenMsg,
} from "./messages";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { PermissionInteractiveService } from "../permission-interactive";
import { Buffer } from "buffer/";

export const getHandler: (
  service: TokenCW20Service,
  permissionInteractionService: PermissionInteractiveService,
  keyRingCosmosService: KeyRingCosmosService
) => Handler = (
  service,
  permissionInteractionService,
  keyRingCosmosService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAllTokenInfosMsg:
        return handleGetAllTokenInfosMsg(service)(
          env,
          msg as GetAllTokenInfosMsg
        );
      case SuggestTokenMsg:
        return handleSuggestTokenMsg(
          service,
          permissionInteractionService,
          keyRingCosmosService
        )(env, msg as SuggestTokenMsg);
      case AddTokenMsg:
        return handleAddTokenMsg(service)(env, msg as AddTokenMsg);
      case RemoveTokenMsg:
        return handleRemoveTokenMsg(service)(env, msg as RemoveTokenMsg);
      case GetSecret20ViewingKey:
        return handleGetSecret20ViewingKey(
          service,
          permissionInteractionService,
          keyRingCosmosService
        )(env, msg as GetSecret20ViewingKey);
      default:
        throw new KeplrError("tokens", 120, "Unknown msg type");
    }
  };
};

const handleGetAllTokenInfosMsg: (
  service: TokenCW20Service
) => InternalHandler<GetAllTokenInfosMsg> = (service) => {
  return () => {
    return service.getAllTokenInfos();
  };
};

const handleSuggestTokenMsg: (
  service: TokenCW20Service,
  permissionInteractionService: PermissionInteractiveService,
  keyRingCosmosService: KeyRingCosmosService
) => InternalHandler<SuggestTokenMsg> = (
  service,
  permissionInteractionService,
  keyRingCosmosService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    const key = await keyRingCosmosService.getKeySelected(msg.chainId);
    const associatedAccountAddress = Buffer.from(key.address).toString("hex");

    await service.suggestToken(
      env,
      msg.chainId,
      msg.contractAddress,
      associatedAccountAddress,
      msg.viewingKey
    );
  };
};

const handleAddTokenMsg: (
  service: TokenCW20Service
) => InternalHandler<AddTokenMsg> = (service) => {
  return async (_, msg) => {
    await service.setToken(
      msg.chainId,
      msg.currency,
      msg.associatedAccountAddress
    );
    return service.getAllTokenInfos();
  };
};

const handleRemoveTokenMsg: (
  service: TokenCW20Service
) => InternalHandler<RemoveTokenMsg> = (service) => {
  return (_, msg) => {
    service.removeToken(
      msg.chainId,
      msg.contractAddress,
      msg.associatedAccountAddress
    );
    return service.getAllTokenInfos();
  };
};

const handleGetSecret20ViewingKey: (
  service: TokenCW20Service,
  permissionInteractionService: PermissionInteractiveService,
  keyRingCosmosService: KeyRingCosmosService
) => InternalHandler<GetSecret20ViewingKey> = (
  service,
  permissionInteractionService,
  keyRingCosmosService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    const key = await keyRingCosmosService.getKeySelected(msg.chainId);
    const associatedAccountAddress = Buffer.from(key.address).toString("hex");

    return service.getSecret20ViewingKey(
      msg.chainId,
      msg.contractAddress,
      associatedAccountAddress
    );
  };
};
