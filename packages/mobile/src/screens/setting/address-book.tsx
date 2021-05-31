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

type AddAddressScreenProps = {
  route: {
    params: {
      index: number;
    };
  };
};

export const AddAddressBookScreen: FunctionComponent<AddAddressScreenProps> = observer(
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

    useEffect(() => {
      if (index >= 0) {
        const data = addressBookConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        memoConfig.setMemo(data.memo);
      }
    }, [
      addressBookConfig.addressBookDatas,
      index,
      memoConfig,
      recipientConfig,
    ]);

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

export const AddressBookScreen: FunctionComponent = observer(() => {
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
              addressBookConfig.selectAddressAt(i);
              navigation.navigate("Send", {
                routeName: "Send",
                params: {
                  initAddress: data.address,
                  initMemo: data.memo,
                },
                key: Math.random() * 10000,
              });
            }}
          />
        );
      })}
    </FullFixedPageWithoutPadding>
  );
});
