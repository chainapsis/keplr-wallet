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
      account?: any;
      /*
      Base account format.
      {
        "@type": string;
        address: string;
        pub_key: {
          "@type": string;
          key: string;
        };
        account_number: string;
        sequence: string;
      };
     */
    },
    // If the account doesn't exist, the result from `auth/accounts` would not have the address.
    // In this case, if `defaultBech32Address` param is provided, this will use it instead of the result from rest.
    defaultBech32Address: string = ""
  ): BaseAccount {
    if (!obj.account) {
      // Case of not existing account.
      // {
      //   "code": 5,
      //   "message": "rpc error: code = NotFound desc = account {address} not found: key not found",
      //   "details": [
      //   ]
      // }
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }

      return new BaseAccount("", defaultBech32Address, new Int(0), new Int(0));
    }

    let value = obj.account;
    const type = value["@type"] || "";

    // If the chain modifies the account type, handle the case where the account type embeds the base account.
    // (Actually, the only existent case is ethermint, and this is the line for handling ethermint)
    const baseAccount =
      value.BaseAccount || value.baseAccount || value.base_account;
    if (baseAccount) {
      value = baseAccount;
    }

    // If the chain modifies the account type, handle the case where the account type embeds the account.
    // (Actually, the only existent case is desmos, and this is the line for handling desmos)
    const embedAccount = value.account;
    if (embedAccount) {
      value = embedAccount;
    }

    // If the account is the vesting account that embeds the base vesting account,
    // the actual base account exists under the base vesting account.
    // But, this can be different according to the version of cosmos-sdk.
    // So, anyway, try to parse it by some ways...
    const baseVestingAccount =
      value.BaseVestingAccount ||
      value.baseVestingAccount ||
      value.base_vesting_account;
    if (baseVestingAccount) {
      value = baseVestingAccount;

      const baseAccount =
        value.BaseAccount || value.baseAccount || value.base_account;
      if (baseAccount) {
        value = baseAccount;
      }
    }

    let address = value.address;
    if (!address) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      address = defaultBech32Address;
    }

    const accountNumber = value.account_number;
    const sequence = value.sequence;

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
