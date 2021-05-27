import React, { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { View } from "react-native";
import { AddressInput, MemoInput, Input } from "../components/form";
import { AddressBook } from "../components/setting";
import {
  AddressBookConfig,
  MemoConfig,
  RecipientConfig,
} from "@keplr-wallet/hooks";

import { FullFixedPage, FullFixedPageWithoutPadding } from "../components/page";
import { HeaderLayout } from "../components/layout";
import { FlexButtonWithHoc } from "./common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  AddressBookSelectHandler,
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";
import { AsyncKVStore } from "../common";
import FeatherIcon from "react-native-vector-icons/Feather";

const AddAddressBookView: FunctionComponent<{
  onGoBack: () => void;
  recipientConfig: RecipientConfig;
  memoConfig: MemoConfig;
  addressBookConfig: AddressBookConfig;
  index: number;
}> = observer(
  ({ onGoBack, recipientConfig, memoConfig, addressBookConfig, index }) => {
    const [name, setName] = useState("");

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
      <React.Fragment>
        <HeaderLayout
          name="Add Address"
          leftIcon={<FeatherIcon name="chevron-left" size={30} />}
          leftIconOnPress={() => {
            onGoBack();
          }}
        />
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
                onGoBack();
              }}
            />
          </View>
        </FullFixedPage>
      </React.Fragment>
    );
  }
);

export const AddressBookView: FunctionComponent<{
  selectHandler?: AddressBookSelectHandler;
}> = observer(({ selectHandler }) => {
  const { chainStore, interactionModalStore } = useStore();
  const current = chainStore.current;

  const [selectedChainId, setSelectedChainId] = useState(current.chainId);

  const recipientConfig = useRecipientConfig(chainStore, selectedChainId);
  const memoConfig = useMemoConfig(chainStore, selectedChainId);

  const addressBookConfig = useAddressBookConfig(
    new AsyncKVStore("address-book"),
    chainStore,
    selectedChainId,
    selectHandler
      ? selectHandler
      : {
          setRecipient: (): void => {
            // noop
          },
          setMemo: (): void => {
            // noop
          },
        }
  );

  const [isAddAddress, setIsAddAddress] = useState(false);
  const [addAddressIndex, setAddAddressIndex] = useState(-1);

  return (
    <FullFixedPageWithoutPadding>
      {isAddAddress ? (
        <AddAddressBookView
          onGoBack={() => {
            setIsAddAddress(false);
          }}
          recipientConfig={recipientConfig}
          memoConfig={memoConfig}
          addressBookConfig={addressBookConfig}
          index={addAddressIndex}
        />
      ) : (
        <React.Fragment>
          <HeaderLayout
            name="Address List"
            leftIcon={<FeatherIcon name="chevron-left" size={30} />}
            leftIconOnPress={() => {
              interactionModalStore.popUrl();
            }}
            rightIcon={<FeatherIcon name="plus" size={30} />}
            rightIconOnPress={() => {
              setIsAddAddress(true);
            }}
          />
          {/* <View style={sf([{ height: 50 }, flexDirectionRow])}>
            {chainStore.chainInfos.map((chainInfo) => {
              return (
                <FlexButtonWithHoc
                  title={chainInfo.chainName}
                  key={chainInfo.chainId}
                  onPress={() => {
                    setSelectedChainId(chainInfo.chainId);
                  }}
                />
              );
            })}
          </View> */}
          {addressBookConfig.addressBookDatas.map((data, i) => {
            return (
              <AddressBook
                isTop={i === 0}
                key={i.toString()}
                name={data.name}
                address={
                  data.address.indexOf(
                    chainStore.getChain(selectedChainId).bech32Config
                      .bech32PrefixAccAddr
                  ) === 0
                    ? Bech32Address.shortenAddress(data.address, 34)
                    : data.address
                }
                data-index={i}
                onPress={() => {
                  addressBookConfig.selectAddressAt(i);
                }}
              />
            );
          })}
        </React.Fragment>
      )}
    </FullFixedPageWithoutPadding>
  );
});
