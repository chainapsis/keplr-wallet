import { Router } from "@keplr/router";
import { GetPersistentMemoryMsg, SetPersistentMemoryMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PersistentMemoryService } from "./service";

export function init(router: Router, service: PersistentMemoryService) {
  router.registerMessage(SetPersistentMemoryMsg);
  router.registerMessage(GetPersistentMemoryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
