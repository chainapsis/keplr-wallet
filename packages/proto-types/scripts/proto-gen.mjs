/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import fs from "fs";

(async () => {
  try {
    const protoTsBinPath = (() => {
      try {
        const binPath = path.join(
          __dirname,
          "../node_modules/.bin/protoc-gen-ts_proto"
        );
        fs.readFileSync(binPath);
        return binPath;
      } catch {
        const binPath = path.join(
          __dirname,
          "../../../node_modules/.bin/protoc-gen-ts_proto"
        );
        fs.readFileSync(binPath);
        return binPath;
      }
    })();

    const baseDirPath = path.join(__dirname, "..");

    const baseProtoPath = path.join(baseDirPath, "proto");
    const thirdPartyProtoPath = path.join(baseDirPath, "third_party/proto");

    const inputs = [
      "cosmos/base/v1beta1/coin.proto",
      "cosmos/bank/v1beta1/bank.proto",
      "cosmos/bank/v1beta1/tx.proto",
      "cosmos/staking/v1beta1/tx.proto",
      "cosmos/gov/v1beta1/gov.proto",
      "cosmos/gov/v1beta1/tx.proto",
      "cosmos/distribution/v1beta1/tx.proto",
      "cosmos/crypto/multisig/v1beta1/multisig.proto",
      "cosmos/crypto/secp256k1/keys.proto",
      "cosmos/tx/v1beta1/tx.proto",
      "cosmos/tx/signing/v1beta1/signing.proto",
      "cosmos/base/abci/v1beta1/abci.proto",
      "cosmwasm/wasm/v1/tx.proto",
      "ibc/applications/transfer/v1/tx.proto",
    ];

    const thirdPartyInputs = ["tendermint/crypto/keys.proto"];

    const outDir = path.join(__dirname, "../src");

    await $`protoc \
      --plugin=${protoTsBinPath} \
      --ts_proto_opt=forceLong=string \
      --ts_proto_opt=esModuleInterop=true \
      --ts_proto_opt=outputClientImpl=false \
      --proto_path=${baseProtoPath} \
      --proto_path=${thirdPartyProtoPath} \
      --ts_proto_out=${outDir} \
      ${inputs.map((i) => path.join(baseProtoPath, i))} \
      ${thirdPartyInputs.map((i) => path.join(thirdPartyProtoPath, i))}`;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
