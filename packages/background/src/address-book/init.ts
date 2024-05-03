import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import {
  AddEntryMsg,
  DeleteEntryMsg,
  ListEntriesMsg,
  UpdateEntryMsg,
} from "./messages";
import { AddressBookService } from "./service";

export function init(router: Router, service: AddressBookService): void {
  router.registerMessage(ListEntriesMsg);
  router.registerMessage(UpdateEntryMsg);
  router.registerMessage(DeleteEntryMsg);
  router.registerMessage(AddEntryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
