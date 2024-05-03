import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "components/page";
import { useStyle } from "styles/index";
import { Image, Text, View, ViewStyle } from "react-native";
import { useSmartNavigation } from "navigation/smart-navigation";
import {
  IMemoConfig,
  IRecipientConfig,
  useAddressBookConfig,
} from "@keplr-wallet/hooks";
import { AsyncKVStore } from "../../../../common";
import { useStore } from "stores/index";
import { RouteProp, useRoute } from "@react-navigation/native";
import { HeaderRightButton } from "components/header";
import { HeaderAddIcon } from "components/header/icon";
import { IconButton } from "components/new/button/icon";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { ThreeDotIcon } from "components/new/icon/three-dot";
import {
  ManageAddressCardModel,
  ManageAddressOption,
} from "components/new/addressbook-card/manage-address-card";
import { ConfirmCardModel } from "components/new/confirm-modal";
import { Button } from "components/button";

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

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showConfirmModal, setConfirmModal] = useState(false);

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
          <IconButton
            icon={<HeaderAddIcon size={19} color="white" />}
            backgroundBlur={false}
            iconStyle={
              style.flatten([
                "width-54",
                "border-width-1",
                "border-color-white@20%",
                "padding-x-12",
                "padding-y-6",
                "justify-center",
                "items-center",
              ]) as ViewStyle
            }
          />
        </HeaderRightButton>
      ),
    });
  }, [addressBookConfig, chainId, chainStore, smartNavigation, style]);

  const isInTransaction = recipientConfig != null || memoConfig != null;

  return addressBookConfig.addressBookDatas.length > 0 ? (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <View style={style.flatten(["height-card-gap"]) as ViewStyle} />
      {addressBookConfig.addressBookDatas.map((data, i) => {
        return (
          <React.Fragment key={i.toString()}>
            <BlurBackground
              borderRadius={12}
              blurIntensity={14}
              containerStyle={
                style.flatten([
                  "padding-x-18",
                  "padding-y-14",
                  "margin-y-6",
                ]) as ViewStyle
              }
              // enabled={isInTransaction}
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
                <View style={style.flatten(["flex-8"]) as ViewStyle}>
                  <Text
                    style={
                      style.flatten([
                        "subtitle2",
                        "color-white",
                        "margin-bottom-4",
                      ]) as ViewStyle
                    }
                  >
                    {data.name}
                  </Text>
                  {data.memo ? (
                    <Text
                      style={
                        style.flatten([
                          "body3",
                          "color-text-low",
                          "margin-bottom-4",
                        ]) as ViewStyle
                      }
                    >
                      {data.memo}
                    </Text>
                  ) : null}
                  <Text
                    style={style.flatten([
                      "text-caption1",
                      "font-medium",
                      "color-white",
                    ])}
                  >
                    {/* {Bech32Address.shortenAddress(data.address, 35)} */}
                    {data.address}
                  </Text>
                </View>
                <View style={style.flatten(["flex-1"]) as ViewStyle}>
                  <IconButton
                    backgroundBlur={false}
                    icon={<ThreeDotIcon />}
                    iconStyle={style.flatten(["padding-12"]) as ViewStyle}
                    onPress={() => setIsOpenModal(true)}
                  />
                  <ManageAddressCardModel
                    isOpen={isOpenModal}
                    title="Manage address"
                    close={() => setIsOpenModal(false)}
                    onSelectWallet={(option: ManageAddressOption) => {
                      switch (option) {
                        case ManageAddressOption.renameAddress:
                          setIsOpenModal(false);
                          smartNavigation.navigateSmart("EditAddressBook", {
                            chainId,
                            addressBookConfig,
                            i,
                          });
                          break;

                        case ManageAddressOption.deleteAddress:
                          setConfirmModal(true);
                          // deleteAddress(i);
                          setIsOpenModal(false);
                          break;
                      }
                    }}
                  />
                  <ConfirmCardModel
                    isOpen={showConfirmModal}
                    close={() => setConfirmModal(false)}
                    title={"Delete address"}
                    subtitle={"Are you sure you want to delete this address?"}
                    select={(confirm: boolean) => {
                      if (confirm) {
                        addressBookConfig.removeAddressBook(i);
                      }
                    }}
                  />
                </View>
              </View>
            </BlurBackground>
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  ) : (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.flatten(["flex-grow-1"])}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
      scrollEnabled={false}
    >
      <View style={style.flatten(["flex-1"])} />
      <View style={style.flatten(["justify-center", "items-center"])}>
        <View style={style.flatten(["margin-bottom-21"]) as ViewStyle}>
          <Image
            style={{ width: 240, height: 60 }}
            source={require("assets/image/emptystate-addressbook.png")}
            fadeDuration={0}
            resizeMode="contain"
          />
        </View>
        <Text
          style={style.flatten([
            "h3",
            "font-medium",
            "color-gray-100",
            "dark:color-platinum-300",
            "text-center",
          ])}
        >
          {"You haven’t saved any\naddresses yet"}
        </Text>
      </View>
      <View style={style.flatten(["margin-top-68", "flex-1"]) as ViewStyle} />
      <Button
        text="Add an address"
        size="large"
        containerStyle={style.flatten(["border-radius-32"]) as ViewStyle}
        textStyle={style.flatten(["body2", "font-normal"]) as ViewStyle}
        onPress={() => {
          smartNavigation.navigateSmart("AddAddressBook", {
            chainId,
            addressBookConfig,
          });
        }}
      />
      <View style={style.flatten(["height-page-pad"]) as ViewStyle} />
    </PageWithScrollView>
  );
});

export * from "./add";
export * from "./edit";
