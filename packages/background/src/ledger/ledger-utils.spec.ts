import { Ledger } from "./ledger";

describe("ledger utils", () => {
  it("converts path to strings", () => {
    const bip44HDPath1 = {
      account: 0,
      change: 0,
      addressIndex: 0,
    };

    const path1: number[] = [
      44,
      60,
      bip44HDPath1.account,
      bip44HDPath1.change,
      bip44HDPath1.addressIndex,
    ];

    expect(Ledger.pathToString(path1)).toBe("m/44'/60'/0'/0/0");

    const bip44HDPath2 = {
      account: 0,
      change: 1,
      addressIndex: 1,
    };

    const path2: number[] = [
      44,
      60,
      bip44HDPath2.account,
      bip44HDPath2.change,
      bip44HDPath2.addressIndex,
    ];

    expect(Ledger.pathToString(path2)).toBe("m/44'/60'/0'/1/1");
  });

  it("converts ethereum signatures to bytes", () => {
    const sig = {
      v: 27,
      r: "01".repeat(16),
      s: "02".repeat(16),
    };

    const bytes = Ledger.ethSignatureToBytes(sig);
    const expBytes = Buffer.from(sig.r + sig.s + "1b", "hex");
    expect(bytes).toStrictEqual(expBytes);
  });
});
