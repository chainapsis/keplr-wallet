import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AccountInterface, Call, Contract, ProviderInterface } from "starknet";
import { compiledSierra } from "./sierra";
import { Dec } from "@keplr-wallet/unit";

export const App: FunctionComponent = observer(() => {
  const [enabled, setEnabled] = useState(
    false
    //(window as any).keplr.starknet.isConnected
  );

  const [account, setAccount] = useState<AccountInterface | undefined>(
    () => (window as any).keplr.starknet.account
  );
  const [provider, setProvider] = useState<ProviderInterface | undefined>(
    () => (window as any).keplr.starknet.provider
  );

  const [erc20, setERC20] = useState<Contract | undefined>();
  const [balance, setBalance] = useState<string | undefined>();

  // account의 주소가 연결 직후에 빈배열로 뜨는 버그가 있음. 일단 나중에 해결한다치고 진행함
  const [_, setT] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setT((t) => t + 1);
    }, 1000);
  }, []);

  if (!enabled) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();

          (window as any).keplr.starknet.enable().then(() => {
            setEnabled(true);
            const account = (window as any).keplr.starknet.account;
            setAccount(account);
            const provider = (window as any).keplr.starknet.provider;
            setProvider(provider);
            const erc20 = new Contract(
              compiledSierra.abi,
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
              (window as any).keplr.starknet.provider
            );
            erc20.connect(account);
            setERC20(erc20);

            erc20["balanceOf"](account.address).then((balance: any) => {
              const dec = new Dec(balance, 18);
              setBalance(dec.toString());
            });
          });
        }}
      >
        Enable
      </button>
    );
  }
  if (account == null || provider == null || erc20 == null) {
    return (
      <div>Some problem exist, account is null even if it was enabled</div>
    );
  }

  return (
    <div>
      <div>{account.address}</div>
      <button
        onClick={async (e) => {
          e.preventDefault();

          const transferCall: Call = erc20.populate("transfer", {
            recipient:
              "0x06add9cf97c3afd614cf14a152829e736c75addcf33cd6f1ff12641318f2560a",
            amount: 10,
          });

          const { transaction_hash: transferTxHash } = await account?.execute(
            transferCall
          );
          console.log(transferTxHash);

          // Wait for the invoke transaction to be accepted on Starknet
          console.log(
            `Waiting for Tx to be Accepted on Starknet - Transfer...`
          );
          await provider.waitForTransaction(transferTxHash);

          // Check balance after transfer - should be 19 NIT
          console.log(`Calling Starknet for account balance...`);
          const balanceAfterTransfer = await erc20?.["balanceOf"](
            account?.address
          );
          console.log("account0 has a balance of:", balanceAfterTransfer);
          console.log("✅ Script completed.");
          const dec = new Dec(balanceAfterTransfer, 18);
          setBalance(dec.toString());
        }}
      >
        test
      </button>
      <div>{balance}</div>
    </div>
  );
});
