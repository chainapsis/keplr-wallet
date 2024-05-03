import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { AddressBookService } from "./service";
import {
  AddEntryMsg,
  DeleteEntryMsg,
  ListEntriesMsg,
  UpdateEntryMsg,
} from "./messages";

export const getHandler: (service: AddressBookService) => Handler = (
  service: AddressBookService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ListEntriesMsg:
        return handleListEntriesMsg(service)(env, msg as ListEntriesMsg);
      case AddEntryMsg:
        return handleAddEntryMsg(service)(env, msg as AddEntryMsg);
      case UpdateEntryMsg:
        return handleUpdateEntryMsg(service)(env, msg as UpdateEntryMsg);
      case DeleteEntryMsg:
        return handleDeleteEntryMsg(service)(env, msg as DeleteEntryMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleListEntriesMsg: (
  service: AddressBookService
) => InternalHandler<ListEntriesMsg> = (service) => {
  return async (_env, _msg) => {
    const chainId = await service.chainService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      _env,
      [chainId],
      _msg.origin
    );
    return service.listEntries();
  };
};

const handleAddEntryMsg: (
  service: AddressBookService
) => InternalHandler<AddEntryMsg> = (service) => {
  return async (_env, _msg) => {
    const chainId = await service.chainService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      _env,
      [chainId],
      _msg.origin
    );
    return service.addEntry(_msg.entry);
  };
};

const handleUpdateEntryMsg: (
  service: AddressBookService
) => InternalHandler<UpdateEntryMsg> = (service) => {
  return async (_env, _msg) => {
    const chainId = await service.chainService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      _env,
      [chainId],
      _msg.origin
    );
    return service.updateEntry(_msg.entry);
  };
};

const handleDeleteEntryMsg: (
  service: AddressBookService
) => InternalHandler<DeleteEntryMsg> = (service) => {
  return async (_env, _msg) => {
    const chainId = await service.chainService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      _env,
      [chainId],
      _msg.origin
    );
    return service.deleteEntry(_msg.address);
  };
};
