import { Guard } from "../types";
import { ExtensionGuards } from "./extension";

export class MockGuards {
  static readonly checkOriginIsValid: Guard =
    ExtensionGuards.checkOriginIsValid;

  static readonly checkMessageIsInternal: Guard =
    ExtensionGuards.checkMessageIsInternal;
}
