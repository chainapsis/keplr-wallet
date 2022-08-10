import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../../components/page";
import { useStyle } from "../../../../styles";
import { Text, View } from "react-native";
import { useSmartNavigation } from "../../../../navigation";
import {
  IMemoConfig,
  IRecipientConfig,
  useAddressBookConfig,
} from "@keplr-wallet/hooks";
import { AsyncKVStore } from "../../../../common";
import { useStore } from "../../../../stores";
import { TrashCanIcon } from "../../../../components/icon";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RectButton } from "../../../../components/rect-button";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderRightButton } from "../../../../components/header";
import { HeaderAddIcon } from "../../../../components/header/icon";
import { AddressBookIcon } from "../../../../components/icon";
import { useConfirmModal } from "../../../../providers/confirm-modal";

const addressBookItemComponent = {
  inTransaction: RectButton,
  inSetting: View,
};

export const AddressBookScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const confirmModal = useConfirmModal();

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

  const chainId = recipientConfig
    ? recipientConfig.chainId
    : chainStore.current.chainId;

  const addressBookConfig = useAddressBookConfig(
    new AsyncKVStore("address_book"),
    chainStore,
    chainId,
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
        <HeaderRightButton
          onPress={() => {
            smartNavigation.navigateSmart("AddAddressBook", {
              chainId,
              addressBookConfig,
            });
          }}
        >
          <HeaderAddIcon />
        </HeaderRightButton>
      ),
    });
  }, [addressBookConfig, chainId, chainStore, smartNavigation, style]);

  const isInTransaction = recipientConfig != null || memoConfig != null;
  const AddressBookItem =
    addressBookItemComponent[isInTransaction ? "inTransaction" : "inSetting"];

  return addressBookConfig.addressBookDatas.length > 0 ? (
    <PageWithScrollView backgroundMode="secondary">
      <View style={style.flatten(["height-card-gap"])} />
      {addressBookConfig.addressBookDatas.map((data, i) => {
        return (
          <React.Fragment key={i.toString()}>
            <AddressBookItem
              style={style.flatten([
                "background-color-white",
                "dark:background-color-platinum-600",
                "padding-x-18",
                "padding-y-14",
              ])}
              enabled={isInTransaction}
              onPress={() => {
                if (isInTransaction) {
                  addressBookConfig.selectAddressAt(i);
                  smartNavigation.goBack();
                }
              }}
            >
              <View
                style={style.flatten([
                  "flex-row",
                  "justify-between",
                  "items-center",
                ])}
              >
                <View>
                  <Text
                    style={style.flatten([
                      "subtitle2",
                      "color-text-middle",
                      "margin-bottom-4",
                    ])}
                  >
                    {data.name}
                  </Text>
                  {data.memo ? (
                    <Text
                      style={style.flatten([
                        "body3",
                        "color-text-low",
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
                      "color-blue-400",
                    ])}
                  >
                    {Bech32Address.shortenAddress(data.address, 30)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={style.flatten(["padding-left-8", "padding-y-12"])}
                  onPress={async () => {
                    if (
                      await confirmModal.confirm({
                        title: "Remove Address",
                        paragraph:
                          "Are you sure you want to remove this address?",
                        yesButtonText: "Remove",
                        noButtonText: "Cancel",
                      })
                    ) {
                      await addressBookConfig.removeAddressBook(i);
                    }
                  }}
                >
                  <TrashCanIcon
                    color={
                      style.flatten([
                        "color-gray-100",
                        "dark:color-platinum-300",
                      ]).color
                    }
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            </AddressBookItem>
            {addressBookConfig.addressBookDatas.length - 1 !== i ? (
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-gray-50",
                  "dark:background-color-platinum-500",
                ])}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  ) : (
    <PageWithScrollView
      backgroundMode="secondary"
      contentContainerStyle={style.flatten(["flex-grow-1"])}
      scrollEnabled={false}
    >
      <View style={style.flatten(["flex-1"])} />
      <View style={style.flatten(["justify-center", "items-center"])}>
        <View style={style.flatten(["margin-bottom-21"])}>
          <AddressBookIcon
            color={
              style.flatten(["color-gray-200", "dark:color-platinum-300"]).color
            }
            height={56}
          />
        </View>
        <Text
          style={style.flatten([
            "subtitle2",
            "color-gray-100",
            "dark:color-platinum-300",
          ])}
        >
          Address book is empty
        </Text>
      </View>
      <View style={style.flatten(["margin-top-68", "flex-1"])} />
    </PageWithScrollView>
  );
});

export * from "./add";
