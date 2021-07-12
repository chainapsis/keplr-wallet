import "mocha";
import assert from "assert";
import { Buffer } from "buffer";
import { ethPublicKeyToAddress, parseEthPrivateKey } from "./index";

describe("Test eth private key matches", () => {
  it("priv key should be processed", () => {
    const privateKey =
      "25ee227d82c2222d7e27aa61bbafd644ea949a817532471be2de38bf149071f3";
    const expectedAddress = "0x742Fc9aFb9e1D8b474Da7b8a21Fd74f3E1633898";
    const expectedRawPubKey =
      "ee7bfb4e1a7346f283f568dc248dd7fc1319412cbaae90df66eabab1c41064f95e2d22ac2f41c720f286759df596817a2c7ce7b1e18febaf705fb5ff8db70ee6";
    const expectedCompressedPubKey =
      "02ee7bfb4e1a7346f283f568dc248dd7fc1319412cbaae90df66eabab1c41064f9";

    const parsed = parseEthPrivateKey(Buffer.from(privateKey, "hex"));
    assert.strictEqual(parsed?.ethAddress, expectedAddress);

    assert.strictEqual(
      Buffer.from(parsed?.rawPublicKey).toString("hex"),
      expectedRawPubKey
    );

    assert.strictEqual(
      Buffer.from(parsed?.compressedPublicKey).toString("hex"),
      expectedCompressedPubKey
    );
  });

  it("can generate a fetch address from a public key", () => {
    const publicKey =
      "02ee7bfb4e1a7346f283f568dc248dd7fc1319412cbaae90df66eabab1c41064f9";
    const expectedFetchAddress = "fetch1s3rfc2n0cjgtqm4e2llvcjtq89yf6q7p2pfxw7";

    assert.strictEqual(
      ethPublicKeyToAddress(Buffer.from(publicKey, "hex")),
      expectedFetchAddress
    );
  });
});
