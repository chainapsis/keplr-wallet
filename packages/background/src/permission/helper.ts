import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class PermissionKeyHelper {
  static globalKey = "_global__permission_";
  static splitter = "!&$";

  protected static throwIfReserved(...keys: (string | number)[]) {
    for (const key of keys) {
      if (String(key).includes(PermissionKeyHelper.splitter)) {
        throw new Error(`Has reserved word: ${key}`);
      }
    }
  }

  protected static _getPermissionKey(
    chainId: string,
    type: string,
    origin: string
  ) {
    PermissionKeyHelper.throwIfReserved(chainId, type, origin);
    return `${ChainIdHelper.parse(chainId).identifier}${
      PermissionKeyHelper.splitter
    }${type}${PermissionKeyHelper.splitter}${origin}`;
  }

  protected static _getOriginFromPermissionKey(
    chainId: string,
    type: string,
    key: string
  ): string | undefined {
    const prefix = `${ChainIdHelper.parse(chainId).identifier}${
      PermissionKeyHelper.splitter
    }${type}${PermissionKeyHelper.splitter}`;
    if (key.startsWith(prefix)) {
      return key.substring(prefix.length);
    }
    return;
  }

  protected static _getTypeAndOriginFromPermissionKey(
    chainId: string,
    key: string
  ): { type: string; origin: string } | undefined {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const prefix = `${chainIdentifier}${PermissionKeyHelper.splitter}`;
    if (key.startsWith(prefix)) {
      const rest = key.substring(prefix.length);
      const split = rest.split(PermissionKeyHelper.splitter);
      if (split.length === 2) {
        return {
          type: split[0],
          origin: split[1],
        };
      }
    }
    return;
  }

  static splitPermissionKey(key: string): {
    // If global permission key, then chainIdentifier will be undefined.
    chainIdentifier?: string;
    type: string;
    origin: string;
  } {
    const split = key.split(PermissionKeyHelper.splitter);
    if (split.length === 3) {
      return {
        chainIdentifier:
          split[0] === PermissionKeyHelper.globalKey ? undefined : split[0],
        type: split[1],
        origin: split[2],
      };
    }

    throw new Error("Invalid permission key");
  }

  static getPermissionKey(chainId: string, type: string, origin: string) {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    if (identifier === PermissionKeyHelper.globalKey) {
      throw new Error("Identifier is reserved for global permission key");
    }
    return PermissionKeyHelper._getPermissionKey(identifier, type, origin);
  }

  static getOriginFromPermissionKey(
    chainId: string,
    type: string,
    key: string
  ): string | undefined {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    if (identifier === PermissionKeyHelper.globalKey) {
      throw new Error("Identifier is reserved for global permission key");
    }
    return PermissionKeyHelper._getOriginFromPermissionKey(
      identifier,
      type,
      key
    );
  }

  static getTypeAndOriginFromPermissionKey(
    chainId: string,
    key: string
  ): { type: string; origin: string } | undefined {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    if (identifier === PermissionKeyHelper.globalKey) {
      throw new Error("Identifier is reserved for global permission key");
    }
    return PermissionKeyHelper._getTypeAndOriginFromPermissionKey(
      identifier,
      key
    );
  }

  static getChainIdentifierFromPermissionKey(
    type: string,
    origin: string,
    key: string
  ): string | undefined {
    const suffix = `${PermissionKeyHelper.splitter}${type}${PermissionKeyHelper.splitter}${origin}`;
    if (
      !key.startsWith(PermissionKeyHelper.globalKey) &&
      key.endsWith(suffix)
    ) {
      return key.substring(0, key.length - suffix.length);
    }
    return;
  }

  static getChainAndTypeFromPermissionKey(
    origin: string,
    key: string
  ): { chainIdentifier: string; type: string } | undefined {
    const suffix = `${PermissionKeyHelper.splitter}${origin}`;
    if (
      !key.startsWith(PermissionKeyHelper.globalKey) &&
      key.endsWith(suffix)
    ) {
      const rest = key.substring(0, key.length - suffix.length);
      const split = rest.split(PermissionKeyHelper.splitter);
      if (split.length === 2) {
        return {
          chainIdentifier: split[0],
          type: split[1],
        };
      }
    }
    return;
  }

  static getGlobalPermissionKey(type: string, origin: string) {
    return PermissionKeyHelper._getPermissionKey(
      PermissionKeyHelper.globalKey,
      type,
      origin
    );
  }

  static getOriginFromGlobalPermissionKey(
    type: string,
    key: string
  ): string | undefined {
    return PermissionKeyHelper._getOriginFromPermissionKey(
      PermissionKeyHelper.globalKey,
      type,
      key
    );
  }

  static getTypeAndOriginFromGlobalPermissionKey(
    key: string
  ): { type: string; origin: string } | undefined {
    return PermissionKeyHelper._getTypeAndOriginFromPermissionKey(
      PermissionKeyHelper.globalKey,
      key
    );
  }
}
