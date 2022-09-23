import { NativeFixtureLoader } from "react-cosmos/native";

// @ts-expect-error
import { rendererConfig, fixtures, decorators } from "../cosmos.userdeps";

export function Cosmos() {
  return (
    <NativeFixtureLoader
      rendererConfig={rendererConfig}
      fixtures={fixtures}
      decorators={decorators}
    />
  );
}
