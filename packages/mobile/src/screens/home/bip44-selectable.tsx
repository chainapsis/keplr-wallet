import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { KeyRingStatus } from "@keplr-wallet/background";
import { LoadingScreenModal } from "../../providers/loading-screen/modal";
import { Dec } from "@keplr-wallet/unit";
import { Text, View } from "react-native";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { useStyle } from "../../styles";
import { RectButton } from "../../components/rect-button";
import { Button } from "../../components/button";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletIcon } from "../setting/components";

export const BIP44Selectable: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);

  const selectables = keyRingStore.getKeyStoreSelectables(
    chainStore.current.chainId
  );

  const needSelectBIP44 =
    keyRingStore.status === KeyRingStatus.UNLOCKED &&
    selectables.needSelectCoinType;

  const [isSelectorModalShow, setIsSelectorModalShow] = useState(false);

  useEffect(() => {
    if (needSelectBIP44) {
      (async () => {
        // Wait to fetch the balances of the accounts.
        const queryBalancesWaiter = selectables.selectables
          .map((selectable) => {
            return queries.queryBalances.getQueryBech32Address(
              selectable.bech32Address
            ).balances;
          })
          .map((bals) => {
            return bals.map((bal) => {
              return bal.waitFreshResponse();
            });
          })
          // Flatten
          .reduce((pre, cur) => {
            return pre.concat(cur);
          }, []);

        // Wait to fetch the account.
        const queryAccountsWaiter = selectables.selectables
          .map((selectable) => {
            return queries.cosmos.queryAccount.getQueryBech32Address(
              selectable.bech32Address
            );
          })
          .map((account) => {
            return account.waitFreshResponse();
          });

        await Promise.all([...queryBalancesWaiter, ...queryAccountsWaiter]);
        // Actually, the response is saved to the stores
        // So, just waiting the response to be fetched and using them are enough.

        // Assume that the first one as the main account of paths.
        const others = selectables.selectables.slice(1);

        // Check that the others have some balances/
        const hasBalances = others.find((other) => {
          const balances = queries.queryBalances.getQueryBech32Address(
            other.bech32Address
          ).balances;
          for (let i = 0; i < balances.length; i++) {
            const bal = balances[i];

            if (bal.balance.toDec().gt(new Dec(0))) {
              return true;
            }
          }

          return false;
        });

        // Check that the others have sent txs.
        const hasSequence = others.find((other) => {
          const account = queries.cosmos.queryAccount.getQueryBech32Address(
            other.bech32Address
          );
          return account.sequence !== "0";
        });

        // If there is no other accounts that have the balances or have sent txs,
        // just select the first account without requesting the users to select the account they want.
        if (!hasBalances && !hasSequence) {
          keyRingStore.setKeyStoreCoinType(
            chainStore.current.chainId,
            selectables.selectables[0].path.coinType
          );
        } else {
          setIsSelectorModalShow(true);
        }
      })();
    }
  }, [
    chainStore,
    keyRingStore,
    needSelectBIP44,
    queries.cosmos.queryAccount,
    queries.queryBalances,
    selectables.selectables,
  ]);

  return (
    <React.Fragment>
      <LoadingScreenModal
        isOpen={needSelectBIP44 && !isSelectorModalShow}
        close={() => {
          // noop
        }}
      />
      <BIP44SelectableModal
        isOpen={needSelectBIP44 && isSelectorModalShow}
        close={() => {
          // noop
        }}
      />
    </React.Fragment>
  );
});

export const BIP44SelectableModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, keyRingStore, queriesStore } = useStore();

    const queries = queriesStore.get(chainStore.current.chainId);

    const style = useStyle();

    const selectables = keyRingStore.getKeyStoreSelectables(
      chainStore.current.chainId
    );

    const [selectedIndex, setSelectedIndex] = useState(-1);

    return (
      <CardModal title="Select your account" disableGesture={true}>
        {selectables.selectables.map((selectable, i) => {
          return (
            <RectButton
              key={selectable.bech32Address}
              style={style.flatten(
                [
                  "padding-20",
                  "border-radius-8",
                  "border-width-2",
                  "border-color-primary-10",
                  "margin-bottom-12",
                ],
                [selectedIndex === i && "border-color-primary"]
              )}
              onPress={() => {
                setSelectedIndex(i);
              }}
            >
              <View style={style.flatten(["flex-row", "items-center"])}>
                <View style={style.flatten(["margin-right-16"])}>
                  <WalletIcon
                    color={style.get("color-text-black-medium").color}
                    height={44}
                  />
                </View>
                <View>
                  <Text
                    style={style.flatten([
                      "subtitle3",
                      "color-text-black-low",
                      "margin-bottom-4",
                    ])}
                  >{`m/44'/${selectable.path.coinType}'`}</Text>
                  <Text
                    style={style.flatten(["body2", "color-text-black-high"])}
                  >
                    {Bech32Address.shortenAddress(selectable.bech32Address, 26)}
                  </Text>
                </View>
              </View>
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-divider",
                  "margin-y-16",
                ])}
              />
              <View
                style={style.flatten([
                  "flex-row",
                  "items-center",
                  "margin-bottom-4",
                ])}
              >
                <Text
                  style={style.flatten([
                    "subtitle2",
                    "color-text-black-medium",
                  ])}
                >
                  Balance
                </Text>
                <View style={style.get("flex-1")} />
                <Text
                  style={style.flatten(["body2", "color-text-black-medium"])}
                >
                  {queries.queryBalances
                    .getQueryBech32Address(selectable.bech32Address)
                    .stakable.balance.shrink(true)
                    .trim(true)
                    .maxDecimals(6)
                    .toString()}
                </Text>
              </View>
              <View style={style.flatten(["flex-row", "items-center"])}>
                <Text
                  style={style.flatten([
                    "subtitle2",
                    "color-text-black-medium",
                  ])}
                >
                  Previous txs
                </Text>
                <View style={style.get("flex-1")} />
                <Text
                  style={style.flatten(["body2", "color-text-black-medium"])}
                >
                  {
                    queries.cosmos.queryAccount.getQueryBech32Address(
                      selectable.bech32Address
                    ).sequence
                  }
                </Text>
              </View>
            </RectButton>
          );
        })}
        <Button
          size="large"
          text="Select Account"
          containerStyle={style.flatten(["margin-top-12"])}
          disabled={selectedIndex < 0}
          onPress={() => {
            keyRingStore.setKeyStoreCoinType(
              chainStore.current.chainId,
              selectables.selectables[selectedIndex].path.coinType
            );
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
