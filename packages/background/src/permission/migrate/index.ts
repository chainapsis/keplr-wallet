import { KVStore } from "@keplr-wallet/common";

export type LegacyGlobalPermissionMap = {
  [type: string]:
    | {
        [origin: string]: true | undefined;
      }
    | undefined;
};

export type LegacyPermissionMap = {
  [chainIdentifier: string]:
    | {
        [type: string]:
          | {
              [origin: string]: true | undefined;
            }
          | undefined;
      }
    | undefined;
};

export async function migrate(
  kvStore: KVStore
): Promise<Record<string, true | undefined> | undefined> {
  const migrated = await kvStore.get<boolean>("permission/migrated/v1");
  if (!migrated) {
    const res: Record<string, true | undefined> = {};

    const map = await kvStore.get<LegacyPermissionMap>("permissionMap");
    const globalMap = await kvStore.get<LegacyGlobalPermissionMap>(
      "globalPermissionMap"
    );

    if (map) {
      for (const chainIdentifier of Object.keys(map)) {
        const typeMap = map[chainIdentifier];
        if (typeMap) {
          for (const type of Object.keys(typeMap)) {
            const originMap = typeMap[type];
            if (originMap) {
              for (const origin of Object.keys(originMap)) {
                const granted = typeMap[origin];
                if (granted) {
                  res[`${chainIdentifier}/${type}/${origin}`] = true;
                }
              }
            }
          }
        }
      }
    }
    if (globalMap) {
      for (const type of Object.keys(globalMap)) {
        const originMap = globalMap[type];
        if (originMap) {
          for (const origin of Object.keys(originMap)) {
            const granted = globalMap[origin];
            if (granted) {
              res[`_global__permission_/${type}/${origin}`] = true;
            }
          }
        }
      }
    }

    await kvStore.set("permission/migrated/v1", true);
    return res;
  }

  return;
}
