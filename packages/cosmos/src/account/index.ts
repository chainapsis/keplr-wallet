import { Int } from "@keplr-wallet/unit";
import { AxiosInstance } from "axios";

export interface Account {
  getType(): string;
  getAddress(): string;
  getAccountNumber(): Int;
  getSequence(): Int;
}

export class BaseAccount implements Account {
  public static async fetchFromRest(
    instance: AxiosInstance,
    address: string,
    // If the account doesn't exist, the result from `auth/accounts` would not have the address.
    // In this case, if `defaultBech32Address` param is provided, this will use it instead of the result from rest.
    defaultBech32Address: boolean = false
  ): Promise<BaseAccount> {
    const result = await instance.get(
      `/cosmos/auth/v1beta1/accounts/${address}`,
      {
        validateStatus: function (status) {
          // Permit 404 not found to handle the case of account not exists
          return (status >= 200 && status < 300) || status === 404;
        },
      }
    );

    return BaseAccount.fromProtoJSON(
      result.data,
      defaultBech32Address ? address : ""
    );
  }

  public static fromProtoJSON(
    obj: {
      account: {
        "@type": string;
        address: string;
        pub_key: {
          "@type": string;
          key: string;
        };
        account_number: string;
        sequence: string;
      };
    },
    // If the account doesn't exist, the result from `auth/accounts` would not have the address.
    // In this case, if `defaultBech32Address` param is provided, this will use it instead of the result from rest.
    defaultBech32Address: string = ""
  ): BaseAccount {
    const type = obj.account["@type"] || "";

    let address = obj.account.address;
    if (!address) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      address = defaultBech32Address;
    }

    const accountNumber = obj.account.account_number;
    const sequence = obj.account.sequence;

    return new BaseAccount(
      type,
      address,
      new Int(accountNumber || "0"),
      new Int(sequence || "0")
    );
  }

  constructor(
    protected readonly type: string,
    protected readonly address: string,
    protected readonly accountNumber: Int,
    protected readonly sequence: Int
  ) {}

  getType(): string {
    return this.type;
  }

  getAddress(): string {
    return this.address;
  }

  getAccountNumber(): Int {
    return this.accountNumber;
  }

  getSequence(): Int {
    return this.sequence;
  }
}
