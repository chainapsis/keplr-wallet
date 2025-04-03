const INPUT_CHARSET =
  "0123456789()[],'/*abcdefgh@:$%{}IJKLMNOPQRSTUVWXYZ&+-.;<=>?!^_|~ijklmnopqrstuvwxyzABCDEFGH`#\"\\ ";
const CHECKSUM_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [
  0xf5dee51989, 0xa9fdca3312, 0x1bab10e32d, 0x3706b1677a, 0x644d626ffd,
];

export class Descriptor {
  public static calculateChecksum(desc: string): string {
    const symbols = this.descsumExpand(desc);
    const extended = symbols.concat(new Array(8).fill(0));
    let chk = BigInt(1);
    const GEN = GENERATOR.map((g) => BigInt(g));
    for (const value of extended) {
      const top = chk >> BigInt(35);
      chk = ((chk & BigInt(0x7ffffffff)) << BigInt(5)) ^ BigInt(value);
      for (let i = 0; i < 5; i++) {
        if (((top >> BigInt(i)) & BigInt(1)) !== BigInt(0)) {
          chk ^= GEN[i];
        }
      }
    }
    const checksumValue = chk ^ BigInt(1);
    let checksum = "";
    for (let i = 0; i < 8; i++) {
      const index = Number((checksumValue >> BigInt(5 * (7 - i))) & BigInt(31));
      checksum += CHECKSUM_CHARSET[index];
    }
    return checksum;
  }

  public static create(
    type: "pkh" | "wpkh" | "tr",
    masterFingerprint: string,
    accountPath: string,
    xpub: string,
    branchOpt?: string
  ): string {
    if (accountPath.startsWith("m/")) {
      accountPath = accountPath.slice(2);
    }

    const segments = accountPath.split("/").filter((s) => s.length > 0);
    let branch: string;
    let normalizedAccountPath: string;
    if (segments.length === 3) {
      normalizedAccountPath = segments.join("/");
      branch = branchOpt !== undefined ? branchOpt : "0";
    } else if (segments.length === 4) {
      normalizedAccountPath = segments.slice(0, 3).join("/");
      branch = segments[3];
    } else {
      throw new Error(
        "Account path must be in the form \"purpose'/coinType'/account'\" or \"purpose'/coinType'/account'/branch\""
      );
    }
    const derivationSuffix = `/${branch}/*`;
    const keyOrigin = `[${masterFingerprint}/${normalizedAccountPath}]`;
    const funcName = type;
    const descNoChecksum = `${funcName}(${keyOrigin}${xpub}${derivationSuffix})`;
    const checksum = this.calculateChecksum(descNoChecksum);
    return `${descNoChecksum}#${checksum}`;
  }

  public static parse(descriptor: string): {
    type: "wpkh" | "tr" | "pkh";
    masterFingerprint: string;
    accountPath: string;
    xpub: string;
    branch?: string;
  } {
    const regex =
      /^(wpkh|tr|pkh)\(\[([0-9a-f]{8})\/(.+?)\]([A-Za-z0-9]+)(\/([01])\/\*)?\)(?:#[0-9a-z]{8})?$/;
    const match = descriptor.match(regex);
    if (!match) {
      throw new Error("Invalid descriptor format");
    }
    const [, type, fingerprint, accountPath, xpub, , branch] = match;
    return {
      type: type as "wpkh" | "tr" | "pkh",
      masterFingerprint: fingerprint,
      accountPath,
      xpub,
      branch,
    };
  }

  private static descsumExpand(s: string): number[] {
    const symbols: number[] = [];
    const groups: number[] = [];
    for (const c of s) {
      const idx = INPUT_CHARSET.indexOf(c);
      if (idx === -1) {
        throw new Error(`Invalid character '${c}' in descriptor`);
      }
      symbols.push(idx & 31);
      groups.push(idx >> 5);
      if (groups.length === 3) {
        symbols.push(groups[0] * 9 + groups[1] * 3 + groups[2]);
        groups.length = 0;
      }
    }
    if (groups.length === 1) {
      symbols.push(groups[0]);
    } else if (groups.length === 2) {
      symbols.push(groups[0] * 3 + groups[1]);
    }
    return symbols;
  }
}
