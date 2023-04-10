import React, {
  EffectCallback,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";

/**
 * FinalizeKeyScene is used to create the key (account).
 * You must `replaceAll()` with this scene to make a key.
 * @constructor
 */
export const FinalizeKeyScene: FunctionComponent<{
  name: string;
  password: string;
  mnemonic?: {
    value: string;
    // If mnemonic is not recovered, but newly generated,
    // it should be set to true.
    isFresh?: boolean;
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    };
  };
  privateKey?: {
    value: Uint8Array;
  };
  ledger?: {
    pubKey: Uint8Array;
    app: string;
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    };
  };
}> = observer(({ name, password, mnemonic, privateKey, ledger }) => {
  const { chainStore, accountStore, queriesStore, keyRingStore } = useStore();

  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "welcome",
        title: "TODO",
        paragraph: "TODO",
      });
    },
  });

  const [isCreated, setIsCreated] = useState(false);
  const [allQueriesSettled, setAllQueriesSettled] = useState(false);
  const [isQueriesTimeout, setIsQueriesTimeout] = useState(false);

  useEffectOnce(() => {
    (async () => {
      if (mnemonic) {
        await keyRingStore.newMnemonicKey(
          mnemonic.value,
          mnemonic.bip44Path,
          name,
          password
        );
      } else if (privateKey) {
        throw new Error("TODO");
      } else if (ledger) {
        await keyRingStore.newLedgerKey(
          ledger.pubKey,
          ledger.app,
          ledger.bip44Path,
          name,
          password
        );
      } else {
        throw new Error("Invalid props");
      }

      let promises: Promise<unknown>[] = [];

      const selectedKeyInfo = keyRingStore.selectedKeyInfo;
      for (const chainInfo of chainStore.chainInfos) {
        // If mnemonic is fresh, there is no way that additional coin type account has value to select.
        if (selectedKeyInfo && selectedKeyInfo.type === "mnemonic") {
          if (
            keyRingStore.needMnemonicKeyCoinTypeFinalize(chainInfo) &&
            mnemonic?.isFresh
          ) {
            promises.push(
              (async () => {
                await keyRingStore.finalizeMnemonicKeyCoinType(
                  selectedKeyInfo.id,
                  chainInfo.chainId,
                  chainInfo.bip44.coinType
                );
              })()
            );
          }
        }
      }

      await Promise.allSettled(promises);

      promises = [];
      for (const chainInfo of chainStore.chainInfos) {
        const account = accountStore.getAccount(chainInfo.chainId);
        promises.push(
          (async () => {
            await account.init();
          })()
        );
      }

      await Promise.allSettled(promises);

      setIsCreated(true);
    })();
  });

  useEffect(() => {
    if (isCreated) {
      const timeoutId = setTimeout(() => {
        setIsQueriesTimeout(true);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isCreated]);

  useEffect(() => {
    let unmounted = false;

    if (isCreated) {
      // Should call once.
      (async () => {
        const promises: Promise<unknown>[] = [];

        for (const chainInfo of chainStore.chainInfos) {
          const account = accountStore.getAccount(chainInfo.chainId);
          if (account.bech32Address) {
            const queries = queriesStore.get(chainInfo.chainId);
            // Prepare queries state to avoid UI flicker on next scene.
            promises.push(
              queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .stakable.waitFreshResponse()
            );
            promises.push(
              queries.cosmos.queryAccount
                .getQueryBech32Address(account.bech32Address)
                .waitFreshResponse()
            );
          }
        }

        await Promise.allSettled(promises);

        if (!unmounted) {
          setAllQueriesSettled(true);
        }
      })();
    }

    return () => {
      unmounted = true;
    };
    // Make sure to this effect called once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreated]);

  // XXX: sceneTransition은 method마다 ref이 변한다.
  //      onceRef이 없으면 무한루프에 빠진다.
  //      처음에 이걸 고려 안해서 이런 문제가 생겨버렸는데
  //      수정할 시간이 없으니 일단 대충 처리한다.
  const onceRef = useRef<boolean>(false);
  useEffect(() => {
    if (!onceRef.current && (isQueriesTimeout || allQueriesSettled)) {
      onceRef.current = true;
      sceneTransition.replace("enable-chains");
    }
  }, [allQueriesSettled, isQueriesTimeout, sceneTransition]);

  return (
    <RegisterSceneBox>
      <div>TODO</div>
    </RegisterSceneBox>
  );
});

const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
