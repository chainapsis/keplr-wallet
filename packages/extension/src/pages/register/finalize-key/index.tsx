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
import { WalletStatus } from "@keplr-wallet/stores";
import AnimCreating from "../../../public/assets/lottie/register/creating.json";
import lottie from "lottie-web";

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
    meta: Record<string, string | undefined>;
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
  stepPrevious: number;
  stepTotal: number;
}> = observer(
  ({
    name,
    password,
    mnemonic,
    privateKey,
    ledger,
    stepPrevious,
    stepTotal,
  }) => {
    const { chainStore, accountStore, queriesStore, keyRingStore } = useStore();

    const sceneTransition = useSceneTransition();

    const header = useRegisterHeader();
    useSceneEvents({
      onWillVisible: () => {
        header.setHeader({
          mode: "empty",
        });
      },
    });

    // Effects depends on below state and these should be called once if length > 0.
    // Thus, you should set below state only once.
    const [candidateAddresses, setCandidateAddresses] = useState<
      {
        chainId: string;
        bech32Addresses: {
          coinType: number;
          address: string;
        }[];
      }[]
    >([]);
    const [vaultId, setVaultId] = useState("");
    const [isAnimEnded, setIsAnimEnded] = useState(false);

    useEffectOnce(() => {
      (async () => {
        // Chain store should be initialized before creating the key.
        await chainStore.waitUntilInitialized();

        let vaultId: unknown;

        if (mnemonic) {
          vaultId = await keyRingStore.newMnemonicKey(
            mnemonic.value,
            mnemonic.bip44Path,
            name,
            password
          );
        } else if (privateKey) {
          vaultId = await keyRingStore.newPrivateKeyKey(
            privateKey.value,
            privateKey.meta,
            name,
            password
          );
        } else if (ledger) {
          vaultId = await keyRingStore.newLedgerKey(
            ledger.pubKey,
            ledger.app,
            ledger.bip44Path,
            name,
            password
          );
        } else {
          throw new Error("Invalid props");
        }

        if (typeof vaultId !== "string") {
          throw new Error("Unknown error");
        }

        await chainStore.waitSyncedEnabledChains();

        let promises: Promise<unknown>[] = [];

        for (const chainInfo of chainStore.chainInfos) {
          // If mnemonic is fresh, there is no way that additional coin type account has value to select.
          if (mnemonic) {
            if (
              keyRingStore.needMnemonicKeyCoinTypeFinalize(
                vaultId,
                chainInfo
              ) &&
              mnemonic?.isFresh
            ) {
              promises.push(
                (async () => {
                  await keyRingStore.finalizeMnemonicKeyCoinType(
                    vaultId,
                    chainInfo.chainId,
                    chainInfo.bip44.coinType
                  );
                })()
              );
            }
          }
        }

        await Promise.allSettled(promises);

        const candidateAddresses: {
          chainId: string;
          bech32Addresses: {
            coinType: number;
            address: string;
          }[];
        }[] = [];

        promises = [];
        for (const chainInfo of chainStore.chainInfos) {
          if (
            mnemonic &&
            keyRingStore.needMnemonicKeyCoinTypeFinalize(vaultId, chainInfo)
          ) {
            promises.push(
              (async () => {
                const res =
                  await keyRingStore.computeNotFinalizedMnemonicKeyAddresses(
                    vaultId,
                    chainInfo.chainId
                  );

                candidateAddresses.push({
                  chainId: chainInfo.chainId,
                  bech32Addresses: res.map((res) => {
                    return {
                      coinType: res.coinType,
                      address: res.bech32Address,
                    };
                  }),
                });
              })()
            );
          } else {
            const account = accountStore.getAccount(chainInfo.chainId);
            promises.push(
              (async () => {
                if (account.walletStatus !== WalletStatus.Loaded) {
                  await account.init();
                }

                if (account.bech32Address) {
                  candidateAddresses.push({
                    chainId: chainInfo.chainId,
                    bech32Addresses: [
                      {
                        coinType: chainInfo.bip44.coinType,
                        address: account.bech32Address,
                      },
                    ],
                  });
                }
              })()
            );
          }
        }

        await Promise.allSettled(promises);

        setVaultId(vaultId);
        setCandidateAddresses(candidateAddresses);
      })();
    });

    useEffect(() => {
      if (candidateAddresses.length > 0) {
        // Should call once.
        (async () => {
          const promises: Promise<unknown>[] = [];

          for (const candidateAddress of candidateAddresses) {
            const queries = queriesStore.get(candidateAddress.chainId);
            for (const bech32Address of candidateAddress.bech32Addresses) {
              // Prepare queries state to avoid UI flicker on next scene.
              promises.push(
                queries.queryBalances
                  .getQueryBech32Address(bech32Address.address)
                  .stakable.waitFreshResponse()
              );
              promises.push(
                queries.cosmos.queryDelegations
                  .getQueryBech32Address(bech32Address.address)
                  .waitFreshResponse()
              );
              promises.push(
                queries.queryBalances
                  .getQueryBech32Address(bech32Address.address)
                  .stakable.waitFreshResponse()
              );
            }
          }

          await Promise.allSettled(promises);
        })();
      }
      // Make sure to this effect called once.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateAddresses]);

    // XXX: sceneTransition은 method마다 ref이 변한다.
    //      onceRef이 없으면 무한루프에 빠진다.
    //      처음에 이걸 고려 안해서 이런 문제가 생겨버렸는데
    //      수정할 시간이 없으니 일단 대충 처리한다.
    const onceRef = useRef<boolean>(false);
    useEffect(() => {
      if (
        !onceRef.current &&
        candidateAddresses.length > 0 &&
        vaultId &&
        isAnimEnded
      ) {
        onceRef.current = true;

        sceneTransition.replace("enable-chains", {
          vaultId,
          candidateAddresses,
          isFresh: mnemonic?.isFresh ?? false,
          stepPrevious: stepPrevious,
          stepTotal: stepTotal,
        });
      }
    }, [
      candidateAddresses,
      isAnimEnded,
      mnemonic?.isFresh,
      sceneTransition,
      vaultId,
    ]);

    const animContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (animContainerRef.current) {
        const anim = lottie.loadAnimation({
          container: animContainerRef.current,
          renderer: "svg",
          loop: false,
          autoplay: true,
          animationData: AnimCreating,
        });

        // When anim ends, the scene will be replaced with next scene.
        // Animation time helps prepare queries state to avoid UI flicker on next scene.
        anim.addEventListener("complete", () => {
          setIsAnimEnded(true);
        });

        return () => {
          anim.destroy();
        };
      }
    }, []);

    return (
      <RegisterSceneBox
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          ref={animContainerRef}
          style={{
            width: "17.5rem",
            height: "17.5rem",
          }}
        />
      </RegisterSceneBox>
    );
  }
);

const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
