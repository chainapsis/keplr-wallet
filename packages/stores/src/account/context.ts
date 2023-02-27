import { Keplr, Key, SettledResponse } from "@keplr-wallet/types";
import { DebounceActionTimer } from "@keplr-wallet/common";

export class AccountSharedContext {
  protected getKeyDecounceTimer = new DebounceActionTimer<
    [keplr: Keplr, chainId: string],
    Key
  >(0, async (requests) => {
    const map = new Map<Keplr, Set<string>>();
    const resMap = new Map<Keplr, Map<string, SettledResponse<Key>>>();

    for (const req of requests) {
      if (!map.has(req.args[0])) {
        map.set(req.args[0], new Set());
      }

      if (!resMap.has(req.args[0])) {
        resMap.set(req.args[0], new Map());
      }

      map.get(req.args[0])!.add(req.args[1]);
    }

    for (const [keplr, chainIdSet] of map) {
      const chainIds = Array.from(chainIdSet);
      const settled = await keplr.getKeysSettled(chainIds);

      const settledMap = resMap.get(keplr)!;
      for (let i = 0; i < chainIds.length; i++) {
        const chainId = chainIds[i];
        const res = settled[i];
        settledMap.set(chainId, res);
      }

      resMap.set(keplr, settledMap);
    }

    return requests.map((req) => resMap.get(req.args[0])!.get(req.args[1])!);
  });

  getKey(
    keplr: Keplr,
    chainId: string,
    action: (res: SettledResponse<Key>) => void
  ): Promise<void> {
    return this.getKeyDecounceTimer.call([keplr, chainId], action);
  }
}
