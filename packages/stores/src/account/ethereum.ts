import { EthereumQueries, IQueriesStore } from "../query";
import { AccountSetBase, AccountSetBaseSuper } from "./base";
import { ChainGetter } from "../chain";
import { AppCurrency, EthSignType } from "@keplr-wallet/types";
import { DenomHelper } from "@keplr-wallet/common";
import { parseEther } from "@ethersproject/units";
import { UnsignedTransaction, serialize } from "@ethersproject/transactions";

export interface EthereumAccount {
  ethereum: EthereumAccountImpl;
}

export const EthereumAccount = {
  use(options: {
    queriesStore: IQueriesStore<EthereumQueries>;
  }): (
    base: AccountSetBaseSuper,
    chainGetter: ChainGetter,
    chainId: string
  ) => EthereumAccount {
    return (base, chainGetter, chainId) => {
      return {
        ethereum: new EthereumAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class EthereumAccountImpl {
  constructor(
    protected readonly base: AccountSetBase,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<EthereumQueries>
  ) {}

  async makeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ): Promise<UnsignedTransaction | undefined> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    if (denomHelper.type === "native") {
      const ethereumNonceQuery = this.queriesStore
        .get(this.chainId)
        .ethereum.queryEthereumNonce.getQueryEthereumNonce(
          this.base.ethereumHexAddress
        );
      await ethereumNonceQuery.waitResponse();
      const value = parseEther(amount).toNumber();
      const to = recipient;
      const gasLimit = 21000;
      const nonce = ethereumNonceQuery.nonce;

      const tx: UnsignedTransaction = {
        value,
        gasLimit,
        gasPrice: 4100000000,
        nonce,
        to,
        chainId: Number(this.chainId),
      };

      return tx;
    }

    return;
  }

  async sendEthereumTx(unsignedTx: UnsignedTransaction) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.base.getKeplr())!;
    const signEthereum = keplr.signEthereum.bind(keplr);
    const signature = await signEthereum(
      this.chainId,
      this.base.ethereumHexAddress,
      JSON.stringify(unsignedTx),
      EthSignType.TRANSACTION
    );

    const rawTransaction = serialize(unsignedTx, signature);

    const sendTx = keplr.sendEthereumTx.bind(keplr);

    const result = await sendTx(this.chainId, rawTransaction);

    return result;
  }
}
