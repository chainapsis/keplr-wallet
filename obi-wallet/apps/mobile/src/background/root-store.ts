import { RootStore } from "@obi-wallet/common";
import { DEFAULT_CHAIN } from "react-native-dotenv";

import { envInvariant } from "../helpers/invariant";

envInvariant("DEFAULT_CHAIN", DEFAULT_CHAIN);
export const rootStore = new RootStore(DEFAULT_CHAIN);
