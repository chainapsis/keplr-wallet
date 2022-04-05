/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import fs from "fs";
import FolderHash from "folder-hash";
import glob from "glob";

async function getDirectoryHash(src) {
  return (await FolderHash.hashElement(src)).hash;
}

(async () => {
  try {
    const outDir = path.join(__dirname, "../src");
    await $`mkdir -p ${outDir}`;

    // When executed in CI, the proto output should not be different with ones built locally.
    let outputSrcHash = undefined;
    if (process.env.CI === "true") {
      console.log("You are ci runner");
      outputSrcHash = await getDirectoryHash(outDir);
    }

    const protoTsBinPath = (() => {
      try {
        const binPath = path.join(
          __dirname,
          "../../node_modules/.bin/protoc-gen-ts_proto"
        );
        fs.readFileSync(binPath);
        return binPath;
      } catch {
        const binPath = path.join(
          __dirname,
          "../../../../node_modules/.bin/protoc-gen-ts_proto"
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
      "secret/compute/v1beta1/msg.proto",
    ];

    const thirdPartyInputs = ["tendermint/crypto/keys.proto"];

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

    if (outputSrcHash && outputSrcHash !== (await getDirectoryHash(outDir))) {
      throw new Error("Output is different");
    }

    // Build javascript output
    const rootDir = path.join(__dirname, "..");
    cd(rootDir);
    await $`npx tsc`;

    // Move javascript output to proto-types package
    const buildOutDir = path.join(rootDir, "./build");
    const targetDir = path.join(rootDir, "..");

    // Remove previous output if exist
    const previous = glob.sync(`${targetDir}/**/*.+(ts|js|cjs|mjs|map)`);
    for (const path of previous) {
      if (
        !path.includes("/proto-types-gen/") &&
        !path.includes("/node_modules/")
      ) {
        await $`rm -f ${path}`;
      }
    }

    await $`cp -R ${buildOutDir + "/"} ${targetDir}`;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
