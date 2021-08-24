import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../../../components/staging/page";
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
import { PlusIcon, TrashCanIcon } from "../../../../../components/staging/icon";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RectButton } from "../../../../../components/staging/rect-button";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderRightButton } from "../../../../../components/staging/header";
import { AddressDeleteModal } from "../../../../../modals/staging/address";

const addressBookItemComponent = {
  inTransaction: RectButton,
  inSetting: View,
};

export const AddressBookScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const [isAddressDeleteModalOpen, setIsAddressDeleteModalOpen] = useState(
    false
  );
  const [deletingAddressIndex, setDeletingAddressIndex] = useState(0);

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
          <PlusIcon
            size={20}
            color={style.get("color-text-black-medium").color}
          />
        </HeaderRightButton>
      ),
    });
  }, [addressBookConfig, chainId, chainStore, smartNavigation, style]);

  const isInTransaction = recipientConfig != null || memoConfig != null;
  const AddressBookItem =
    addressBookItemComponent[isInTransaction ? "inTransaction" : "inSetting"];

  return (
    <PageWithScrollView>
      <View style={style.flatten(["height-card-gap"])} />
      {addressBookConfig.addressBookDatas.map((data, i) => {
        return (
          <React.Fragment key={i.toString()}>
            <AddressBookItem
              style={style.flatten([
                "background-color-white",
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
                </View>
                <TouchableOpacity
                  style={style.flatten(["padding-left-8", "padding-y-12"])}
                  onPress={() => {
                    setDeletingAddressIndex(i);
                    setIsAddressDeleteModalOpen(true);
                  }}
                >
                  <TrashCanIcon
                    color={style.get("color-text-black-very-very-low").color}
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            </AddressBookItem>
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
      <AddressDeleteModal
        isOpen={isAddressDeleteModalOpen}
        close={() => setIsAddressDeleteModalOpen(false)}
        addressBookConfig={addressBookConfig}
        addressIndex={deletingAddressIndex}
      />
    </PageWithScrollView>
  );
});

export * from "./add";
