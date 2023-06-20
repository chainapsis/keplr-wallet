import { Permit } from "@keplr-wallet/types";

export abstract class QueryAuthorization {
  abstract getId(): string;
  abstract toString(): string;

  static fromInput(input: string | Permit): QueryAuthorization {
    if (typeof input === "string") {
      try {
        const permit: Permit = JSON.parse(input);
        return new PermitQueryAuthorization(permit);
      } catch (error) {
        return new ViewingKeyAuthorization(input);
      }
    } else {
      return new PermitQueryAuthorization(input);
    }
  }
}

export class PermitQueryAuthorization extends QueryAuthorization {
  constructor(public permit: Permit) {
    super();
  }

  getId(): string {
    return this.permit.signature.signature;
  }

  toString(): string {
    return JSON.stringify(this.permit);
  }
}

export class ViewingKeyAuthorization extends QueryAuthorization {
  constructor(public value: string) {
    super();
  }

  getId(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
