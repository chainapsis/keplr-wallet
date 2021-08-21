import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../../../components/staging/page";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStyle } from "../../../../../styles";
import { Text, View } from "react-native";
import { useSmartNavigation } from "../../../../../navigation";
import {
  IMemoConfig,
  IRecipientConfig,
  useAddressBookConfig,
} from "@keplr-wallet/hooks";
import { AsyncKVStore } from "../../../../../common";
import { useStore } from "../../../../../stores";
import { PlusIcon } from "../../../../../components/staging/icon";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RectButton } from "../../../../../components/staging/rect-button";

export const AddressBookScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          recipientConfig?: IRecipientConfig;
          memoConfig?: IMemoConfig;
        }
      >,
      string
    >
  >();

  const recipientConfig = route.params.recipientConfig;
  const memoConfig = route.params.memoConfig;

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const addressBookConfig = useAddressBookConfig(
    new AsyncKVStore("address_book"),
    chainStore,
    chainStore.current.chainId,
    {
      setRecipient: (recipient: string) => {
        if (recipientConfig) {
          recipientConfig.setRawRecipient(recipient);
        }
      },
      setMemo: (memo: string) => {
        if (memoConfig) {
          memoConfig.setMemo(memo);
        }
      },
    }
  );

  useEffect(() => {
    smartNavigation.setOptions({
      // eslint-disable-next-line react/display-name
      headerRight: () => (
        <TouchableOpacity
          style={style.flatten(["padding-8", "margin-right-8"])}
          onPress={() => {
            smartNavigation.navigateSmart("AddAddressBook", {
              chainId: chainStore.current.chainId,
              addressBookConfig,
            });
          }}
        >
          <PlusIcon
            size={20}
            color={style.get("color-text-black-medium").color}
          />
        </TouchableOpacity>
      ),
    });
  }, [addressBookConfig, chainStore, smartNavigation, style]);

  return (
    <PageWithScrollView>
      <View style={style.flatten(["height-card-gap"])} />
      {addressBookConfig.addressBookDatas.map((data, i) => {
        return (
          <React.Fragment key={i.toString()}>
            <RectButton
              style={style.flatten([
                "background-color-white",
                "padding-x-18",
                "padding-y-14",
              ])}
              enabled={recipientConfig != null || memoConfig != null}
              onPress={() => {
                if (recipientConfig || memoConfig) {
                  addressBookConfig.selectAddressAt(i);
                  smartNavigation.goBack();
                }
              }}
            >
              <Text
                style={style.flatten([
                  "subtitle2",
                  "color-text-black-medium",
                  "margin-bottom-4",
                ])}
              >
                {data.name}
              </Text>
              {data.memo ? (
                <Text
                  style={style.flatten([
                    "body3",
                    "color-text-black-low",
                    "margin-bottom-4",
                  ])}
                >
                  {data.memo}
                </Text>
              ) : null}
              <Text
                style={style.flatten([
                  "text-caption1",
                  "font-medium",
                  "color-primary",
                ])}
              >
                {Bech32Address.shortenAddress(data.address, 30)}
              </Text>
            </RectButton>
            {addressBookConfig.addressBookDatas.length - 1 !== i ? (
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-border-white",
                ])}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  );
});

export * from "./add";
