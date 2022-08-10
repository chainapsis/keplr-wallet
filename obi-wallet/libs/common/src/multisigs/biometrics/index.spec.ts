import {
  createMultisigThresholdPubkey,
  pubkeyToAddress,
  pubkeyType,
} from "@cosmjs/amino";

import { compressSec256k1PublicKey } from ".";

test("compressSec256k1PublicKey", () => {
  const publicKey =
    "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWHyJbWPJbfuNmh+LlGYxOBYIq1RK\r\nHyZIasp5RnXG3HvgcET12NnjRtFykL2LubapZ75NVm8r+fr1xyBkj1h/NA==\n-----END PUBLIC KEY-----";
  const multisigThresholdPubKey = createMultisigThresholdPubkey(
    [
      {
        type: pubkeyType.secp256k1,
        value: compressSec256k1PublicKey(publicKey),
      },
    ],
    1
  );
  const address = pubkeyToAddress(multisigThresholdPubKey, "juno");
  expect(address).toBeDefined();
});
