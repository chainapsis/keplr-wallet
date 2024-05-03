import React, { FunctionComponent, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { ChipButton } from "components/new/chip";
import { BlurButton } from "components/new/button/blur-button";
import { Button } from "components/button";
import { AddressCopyable } from "components/new/address-copyable";
import {
  DrawerActions,
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { MultiKeyStoreInfoWithSelectedElem } from "@keplr-wallet/background";
import { useStore } from "stores/index";
import { IconButton } from "components/new/button/icon";
import {
  ManageWalletOption,
  WalletCardModel,
} from "components/new/wallet-card/wallet-card";
import { ChangeWalletCardModel } from "components/new/wallet-card/change-wallet";
import { EditAccountNameModal } from "modals/edit-account-name.tsx";
import { PasswordInputModal } from "modals/password-input/modal";
import { useLoadingScreen } from "providers/loading-screen";
import { ChevronDownIcon } from "components/new/icon/chevron-down";
import { ThreeDotIcon } from "components/new/icon/three-dot";

export const AccountSection: FunctionComponent<{ containtStyle?: ViewStyle }> =
  observer(({ containtStyle }) => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const loadingScreen = useLoadingScreen();
    const style = useStyle();
    const [selectedId, setSelectedId] = useState<string>("1");
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [changeWalletModal, setChangeWalletModal] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedKeyStore, setSelectedKeyStore] =
      useState<MultiKeyStoreInfoWithSelectedElem>();
    const {
      chainStore,
      accountStore,
      queriesStore,
      priceStore,
      keyRingStore,
      analyticsStore,
      keychainStore,
    } = useStore();

    const waitingNameData = keyRingStore.waitingNameData?.data;

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;
    const stakable = queryStakable.balance;

    const queryDelegated =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
      );
    const delegated = queryDelegated.total;

    const queryUnbonding =
      queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
        account.bech32Address
      );
    const unbonding = queryUnbonding.total;

    const stakedSum = delegated.add(unbonding);

    const total = stakable.add(stakedSum);

    const totalPrice = priceStore.calculatePrice(total);

    const accountSectionList = [
      { id: "1", title: "Your Balance" },
      { id: "2", title: "Available" },
      { id: "3", title: "Staked" },
    ];

    const renderItem = ({ item }: any) => {
      const selected = item.id === selectedId;
      return (
        <BlurButton
          backgroundBlur={selected}
          text={item.title}
          onPress={() => setSelectedId(item.id)}
        />
      );
    };

    const showBalance = () => {
      switch (selectedId) {
        case "1":
          return totalPrice
            ? totalPrice.toString()
            : total.shrink(true).maxDecimals(6).toString();

        case "2":
          return stakable.maxDecimals(6).trim(true).shrink(true).toString();

        case "3":
          return stakedSum.maxDecimals(6).trim(true).shrink(true).toString();
      }
    };
    return (
      <React.Fragment>
        <BlurBackground
          borderRadius={16}
          blurIntensity={16}
          containerStyle={
            [
              style.flatten([
                "margin-x-12",
                "padding-20",
                "border-width-1",
                "border-color-indigo-200",
              ]),
              containtStyle,
            ] as ViewStyle
          }
        >
          <View
            style={style.flatten(["flex-row", "justify-between"]) as ViewStyle}
          >
            <View>
              <View
                style={
                  style.flatten([
                    "flex-row",
                    "items-center",
                    "margin-right-6",
                    "margin-bottom-6",
                  ]) as ViewStyle
                }
              >
                <Text
                  style={
                    style.flatten([
                      "h6",
                      "color-white",
                      "margin-right-6",
                    ]) as ViewStyle
                  }
                >
                  {account.name}
                </Text>
              </View>
              <AddressCopyable
                address={account.bech32Address}
                maxCharacters={16}
              />
            </View>
            <View style={style.flatten(["flex-row"])}>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setIsOpenModal(true)}
              >
                <IconButton
                  backgroundBlur={true}
                  icon={<ThreeDotIcon />}
                  iconStyle={
                    style.flatten([
                      "padding-10",
                      "margin-right-12",
                    ]) as ViewStyle
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
              >
                <ChipButton
                  containerStyle={style.flatten(["padding-x-12"]) as ViewStyle}
                  text={chainStore.current.chainName}
                  icon={<ChevronDownIcon />}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* this is tab view */}
          <View
            style={style.flatten(["flex-row", "margin-top-32"]) as ViewStyle}
          >
            <FlatList
              data={accountSectionList}
              renderItem={renderItem}
              horizontal={true}
              keyExtractor={(item) => item.id}
              extraData={selectedId}
            />
          </View>
          <View
            style={
              style.flatten([
                "padding-top-20",
                "padding-bottom-20",
              ]) as ViewStyle
            }
          >
            <Text style={style.flatten(["h1", "color-white"]) as ViewStyle}>
              {showBalance()}
            </Text>
          </View>
          <Button
            text="Claim staking rewards"
            size="default"
            color="gradient"
            containerStyle={
              style.flatten([
                "background-color-white",
                "border-radius-64",
              ]) as ViewStyle
            }
            rippleColor="black@50%"
          />
        </BlurBackground>

        <WalletCardModel
          isOpen={isOpenModal}
          title="Manage Wallet"
          close={() => setIsOpenModal(false)}
          onSelectWallet={(option: ManageWalletOption) => {
            switch (option) {
              case ManageWalletOption.changeWallet:
                setChangeWalletModal(true);
                setIsOpenModal(false);
                break;

              case ManageWalletOption.renameWallet:
                keyRingStore.multiKeyStoreInfo.map((keyStore) => {
                  if (keyStore.meta?.["name"] === account.name) {
                    setSelectedKeyStore(keyStore);
                  }
                });
                setIsRenameModalOpen(true);
                setIsOpenModal(false);
                break;

              case ManageWalletOption.deleteWallet:
                setIsDeleteModalOpen(true);
                setIsOpenModal(false);
                break;
            }
          }}
        />

        <ChangeWalletCardModel
          isOpen={changeWalletModal}
          title="Change Wallet"
          keyRingStore={keyRingStore}
          close={() => setChangeWalletModal(false)}
          onChangeAccount={async (keyStore) => {
            const index = keyRingStore.multiKeyStoreInfo.indexOf(keyStore);
            if (index >= 0) {
              loadingScreen.setIsLoading(true);
              await keyRingStore.changeKeyRing(index);
              loadingScreen.setIsLoading(false);
            }
          }}
        />

        <EditAccountNameModal
          isOpen={isRenameModalOpen}
          close={() => setIsRenameModalOpen(false)}
          title="Edit Account Name"
          isReadOnly={
            waitingNameData !== undefined && !waitingNameData?.editable
          }
          onEnterName={async (name) => {
            try {
              const selectedIndex = keyRingStore.multiKeyStoreInfo.findIndex(
                (keyStore) => keyStore == selectedKeyStore
              );

              await keyRingStore.updateNameKeyRing(selectedIndex, name.trim());
              setSelectedKeyStore(undefined);
              setIsRenameModalOpen(false);
            } catch (e) {
              console.log("Fail to decrypt: " + e.message);
            }
          }}
        />

        <PasswordInputModal
          isOpen={isDeleteModalOpen}
          close={() => setIsDeleteModalOpen(false)}
          title="Remove Account"
          onEnterPassword={async (password) => {
            const index = keyRingStore.multiKeyStoreInfo.findIndex(
              (keyStore) => keyStore.selected
            );

            if (index >= 0) {
              await keyRingStore.deleteKeyRing(index, password);
              analyticsStore.logEvent("Account removed");

              if (keyRingStore.multiKeyStoreInfo.length === 0) {
                await keychainStore.reset();

                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Unlock",
                    },
                  ],
                });
              }
            }
          }}
        />
      </React.Fragment>
    );
  });
