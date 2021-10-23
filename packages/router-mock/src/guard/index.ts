import { Guard } from "@keplr-wallet/router";
import { ExtensionGuards } from "@keplr-wallet/router-extension";

export class MockGuards {
  static readonly checkOriginIsValid: Guard =
    ExtensionGuards.checkOriginIsValid;

  static readonly checkMessageIsInternal: Guard =
    ExtensionGuards.checkMessageIsInternal;
}
