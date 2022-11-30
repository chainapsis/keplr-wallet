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

    expect(() => Ledger.pathToString([44, 60, 0, 1])).toThrow();
    expect(() => Ledger.pathToString([44, 60, 0, 1, 1, 1])).toThrow();
  });

  it("converts ethereum signatures to bytes", () => {
    let sig = {
      v: 27,
      r: "01".repeat(32),
      s: "02".repeat(32),
    };

    let bytes = Ledger.ethSignatureToBytes(sig);
    let expBytes = Buffer.from(sig.r + sig.s + "1b", "hex");
    expect(Buffer.from(bytes).equals(expBytes)).toBe(true);

    sig = {
      v: 28,
      r: "03".repeat(32),
      s: "04".repeat(32),
    };

    bytes = Ledger.ethSignatureToBytes(sig);
    expBytes = Buffer.from(sig.r + sig.s + "1c", "hex");
    expect(Buffer.from(bytes).equals(expBytes)).toBe(true);
  });

  it("throw error if ethereum signatures is invalid", () => {
    expect(() => {
      Ledger.ethSignatureToBytes({
        v: 27,
        r: "01".repeat(32),
        // Not 32 bytes
        s: "02".repeat(32) + "00",
      });
    }).toThrow();

    expect(() => {
      Ledger.ethSignatureToBytes({
        v: 27,
        // Not 32 bytes
        r: "01".repeat(32) + "00",
        s: "02".repeat(32),
      });
    }).toThrow();

    expect(() => {
      Ledger.ethSignatureToBytes({
        v: 27,
        r: "",
        s: "",
      });
    }).toThrow();

    expect(() => {
      Ledger.ethSignatureToBytes({
        v: 27,
        // invalid hex encoded
        r: "01".repeat(30) + "xx",
        s: "02".repeat(32),
      });
    }).toThrow();

    expect(() => {
      Ledger.ethSignatureToBytes({
        // Not integer
        v: 27.5,
        r: "01".repeat(32),
        s: "02".repeat(32),
      });
    }).toThrow();
  });
});
