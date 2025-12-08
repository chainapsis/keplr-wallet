import {
  Account,
  CairoVersion,
  Call,
  InvokeFunctionResponse,
  ProviderInterface,
  ProviderOptions,
  SignerInterface,
  num,
  stark,
  transaction as starkTransaction,
  InvocationsSignerDetails,
} from "starknet";
import { KeyRingStarknetService } from "./service";
import { Env } from "@keplr-wallet/router";

export class AccountImpl extends Account {
  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    pkOrSigner: Uint8Array | string | SignerInterface,
    cairoVersion?: CairoVersion,
    transactionVersion?: "0x3"
  ) {
    super({
      provider: providerOrOptions,
      address,
      signer: pkOrSigner,
      cairoVersion,
      transactionVersion,
    });
  }

  async executeWithSignUI(
    env: Env,
    origin: string,
    keplrChainId: string,
    service: KeyRingStarknetService,
    transactions: Call[]
  ): Promise<InvokeFunctionResponse> {
    // XXX: 계정이 deploy되어있지 않을때는 nonce가 0가 나올 수 있도록 getNonceSafe()를 사용한다.
    const nonce = num.toBigInt(await this.getNonceSafe());
    const version = "0x3";

    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      ...stark.v3Details({}),
      // XXX: Fee 과련은 UI에서 estimate해서 처리한다.
      resourceBounds: {
        l1_gas: {
          max_amount: num.toBigInt("0"),
          max_price_per_unit: num.toBigInt("0"),
        },
        l2_gas: {
          max_amount: num.toBigInt("0"),
          max_price_per_unit: num.toBigInt("0"),
        },
        l1_data_gas: {
          max_amount: num.toBigInt("0"),
          max_price_per_unit: num.toBigInt("0"),
        },
      },
      walletAddress: this.address,
      nonce,
      version,
      chainId,
      cairoVersion: await this.getCairoVersion(),
    };

    const {
      transactions: newTransactions,
      details: newDetails,
      signature,
    } = await service.signStarknetTransactionSelected(
      env,
      origin,
      keplrChainId,
      transactions,
      signerDetails,
      false
    );

    const calldata = starkTransaction.getExecuteCalldata(
      newTransactions,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      {
        ...newDetails,
      }
    );
  }
}
