import Axios from "axios";

import { Account } from "@everett-protocol/cosmosjs/core/account";
import { BaseAccount } from "@everett-protocol/cosmosjs/common/baseAccount";
import { Bech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";
import { useBech32Config } from "@everett-protocol/cosmosjs/common/address";

const Buffer = require("buffer/").Buffer;

export async function getAccount(
  rpc: string,
  bech32: Bech32Config,
  address: string
): Promise<Account> {
  const result = await Axios.get(rpc + "/abci_query", {
    params: {
      path: "0x" + Buffer.from("custom/acc/account").toString("hex"),
      data:
        "0x" +
        Buffer.from(
          JSON.stringify({
            Address: address
          })
        ).toString("hex")
    }
  });

  if (result.status !== 200) {
    throw new Error(result.statusText);
  }

  if (result.data) {
    const r = result.data;
    if (r.result && r.result.response) {
      const response = r.result.response;
      console.log(response);

      if (response.code !== undefined && response.code !== 0) {
        throw new Error(response.log);
      }

      const value = JSON.parse(
        Buffer.from(response.value, "base64").toString()
      );
      console.log(value);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useBech32Config(bech32, () => {
        return BaseAccount.fromJSON(value);
      });
    }
  }

  throw new Error("Unknown error");
}
