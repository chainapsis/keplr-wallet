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
    const result = await instance.get(`auth/accounts/${address}`);

    return BaseAccount.fromAminoJSON(
      result.data,
      defaultBech32Address ? address : ""
    );
  }

  public static fromAminoJSON(
    obj:
      | {
          height: string;
          result: {
            type: string;
            value: any;
          };
        }
      | { type: string; value: any },
    // If the account doesn't exist, the result from `auth/accounts` would not have the address.
    // In this case, if `defaultBech32Address` param is provided, this will use it instead of the result from rest.
    defaultBech32Address: string = ""
  ): BaseAccount {
    if ("height" in obj) {
      obj = obj.result;
    }

    const type = obj.type || "";

    let value = "value" in obj ? obj.value : obj;

    // If the account is the vesting account that embeds the base vesting account,
    // the actual base account exists under the base vesting account.
    // But, this can be different according to the version of cosmos-sdk.
    // So, anyway, try to parse it by some ways...
    const baseVestingAccount =
      value.BaseVestingAccount ||
      value.baseVestingAccount ||
      value.base_vesting_account;
    if (baseVestingAccount) {
      value =
        baseVestingAccount.BaseAccount ||
        baseVestingAccount.baseAccount ||
        baseVestingAccount.base_account;
    }

    let address = value.address;
    if (!address) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      address = defaultBech32Address;
    }

    const accountNumber = value.account_number;
    if (accountNumber == null) {
      throw new Error(
        `Account's account number is unknown: ${JSON.stringify(obj)}`
      );
    }

    const sequence = value.sequence;

    return new BaseAccount(
      type,
      address,
      new Int(accountNumber),
      new Int(sequence ?? "0")
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
