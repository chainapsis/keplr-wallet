import { ComponentProps } from "react";
import { NativeFixtureLoader } from "react-cosmos/native";
import invariant from "tiny-invariant";

const pkg:
  | ComponentProps<typeof NativeFixtureLoader>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  | Record<string, never> = require("../cosmos.userdeps.js");

export function Cosmos() {
  if (!isNativeFixtureLoaderProps(pkg)) {
    invariant(
      false,
      "Since `COSMOS_ENABLED === 'true'`, `../cosmos.userdeps.js` should exist. Did you forget to run `yarn cosmos`?"
    );
    return null;
  }

  return <NativeFixtureLoader {...pkg} />;
}

function isNativeFixtureLoaderProps(
  pkg: ComponentProps<typeof NativeFixtureLoader> | Record<string, never>
): pkg is ComponentProps<typeof NativeFixtureLoader> {
  return typeof pkg === "object" && Object.keys(pkg).length > 0;
}
