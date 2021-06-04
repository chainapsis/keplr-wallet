/* eslint-disable react/display-name */
import React, { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { View } from "react-native";
import { AddressInput, MemoInput, Input } from "../../components/form";
import { AddressBook } from "../../components/setting";
import {
  FullFixedPage,
  FullFixedPageWithoutPadding,
} from "../../components/page";
import { FlexButtonWithHoc } from "../../modals/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";
import { AsyncKVStore } from "../../common";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GradientBackground } from "../../components/svg";
import { sf, fcHigh, h3, mr2 } from "../../styles";
import FeatherIcon from "react-native-vector-icons/Feather";
import { RectButton } from "react-native-gesture-handler";

const ModalStack = createStackNavigator();

export const AddressBookModalStackScreen: FunctionComponent = () => {
  const navigation = useNavigation();

  return (
    <ModalStack.Navigator
      initialRouteName="Address Book Modal"
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerTitleStyle: sf([h3, fcHigh]),
        headerBackTitleVisible: false,
      }}
    >
      <ModalStack.Screen
        name="Address Book Modal"
        component={AddressBookModalScreen}
        options={{
          headerRight: () => (
            <RectButton
              style={mr2}
              onPress={() => {
                navigation.navigate("Add Address Book Modal", { index: -1 });
              }}
            >
              <View accessible>
                <FeatherIcon name="plus" size={30} />
              </View>
            </RectButton>
          ),
          title: "Address Book",
        }}
      />
      <ModalStack.Screen
        name="Add Address Book Modal"
        component={AddAddressBookModalScreen}
        options={{
          title: "Add Address Book",
        }}
      />
    </ModalStack.Navigator>
  );
};

type AddAddressModalScreenProps = {
  route: {
    params: {
      index: number;
    };
  };
};

const AddAddressBookModalScreen: FunctionComponent<AddAddressModalScreenProps> = observer(
  ({ route }) => {
    const { index } = route.params;

    const navigation = useNavigation();

    const [name, setName] = useState("");
    const { chainStore } = useStore();
    const selectedChainId = chainStore.current.chainId;

    const recipientConfig = useRecipientConfig(chainStore, selectedChainId);
    const memoConfig = useMemoConfig(chainStore, selectedChainId);

    const addressBookConfig = useAddressBookConfig(
      new AsyncKVStore("address-book"),
      chainStore,
      selectedChainId,
      {
        setRecipient: (): void => {
          // noop
        },
        setMemo: (): void => {
          // noop
        },
      }
    );

    //  To Do  => Edit Address
    // useEffect(() => {
    //   if (index >= 0) {
    //     const data = addressBookConfig.addressBookDatas[index];
    //     setName(data.name);
    //     recipientConfig.setRawRecipient(data.address);
    //     memoConfig.setMemo(data.memo);
    //   }
    // }, [
    //   addressBookConfig.addressBookDatas,
    //   index,
    //   memoConfig,
    //   recipientConfig,
    // ]);

    return (
      <FullFixedPage>
        <Input
          label="Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
          }}
        />
        <AddressInput recipientConfig={recipientConfig} />
        <MemoInput memoConfig={memoConfig} />
        <View style={{ height: 45 }}>
          <FlexButtonWithHoc
            title="Save"
            disabled={
              !name ||
              recipientConfig.getError() != null ||
              memoConfig.getError() != null
            }
            onPress={async () => {
              if (!recipientConfig.recipient) {
                throw new Error("Invalid address");
              }

              if (index < 0) {
                await addressBookConfig.addAddressBook({
                  name,
                  address: recipientConfig.recipient,
                  memo: memoConfig.memo,
                });
              } else {
                await addressBookConfig.editAddressBookAt(index, {
                  name,
                  address: recipientConfig.recipient,
                  memo: memoConfig.memo,
                });
              }

              // Clear the recipient and memo before closing
              recipientConfig.setRawRecipient("");
              memoConfig.setMemo("");
              navigation.goBack();
            }}
          />
        </View>
      </FullFixedPage>
    );
  }
);

const AddressBookModalScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  const { chainStore } = useStore();

  const addressBookConfig = useAddressBookConfig(
    new AsyncKVStore("address-book"),
    chainStore,
    chainStore.current.chainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      addressBookConfig.loadAddressBookDatas();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [addressBookConfig, navigation]);

  return (
    <FullFixedPageWithoutPadding>
      {addressBookConfig.addressBookDatas.map((data, i) => {
        return (
          <AddressBook
            isTop={i === 0}
            key={i.toString()}
            name={data.name}
            address={
              data.address.indexOf(
                chainStore.getChain(chainStore.current.chainId).bech32Config
                  .bech32PrefixAccAddr
              ) === 0
                ? Bech32Address.shortenAddress(data.address, 34)
                : data.address
            }
            data-index={i}
            onPress={() => {
              navigation.navigate("Send", {
                initAddress: data.address,
                initMemo: data.memo,
              });
            }}
            onDelete={() => {
              addressBookConfig.removeAddressBook(i);
            }}
            // To Do => Edit Address
            // onEdit={() => {
            //   navigation.navigate("Add Address Book Modal", { index: i });
            // }}
          />
        );
      })}
    </FullFixedPageWithoutPadding>
  );
});
