import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { RecipientInput, TextInput } from "../../../../components/input";
import { RecipientInput as RecipientInputForStarknet } from "../../../starknet/components/input/reciepient-input";
import { RecipientInput as RecipientInputForBitcoin } from "../../../bitcoin/components/input/recipient-input";
import { useSearchParams } from "react-router-dom";
import {
  useMemoConfig,
  useRecipientConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import {
  useRecipientConfig as useRecipientConfigForStarknet,
  useTxConfigsValidate as useTxConfigsValidateForStarknet,
} from "@keplr-wallet/hooks-starknet";
import {
  useRecipientConfig as useRecipientConfigForBitcoin,
  useTxConfigsValidate as useTxConfigsValidateForBitcoin,
} from "@keplr-wallet/hooks-bitcoin";
import { useStore } from "../../../../stores";
import { MemoInput } from "../../../../components/input/memo-input";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { ENSInfo } from "../../../../config.ui";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();
  const labelRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const intl = useIntl();

  // CHECK: starknet, bitcoin만 활성화되어 있는 경우 chainInfosInUI의 길이가 0이 됨으로 인해 참조 오류 발생
  const [chainId, setChainId] = useState(chainStore.chainInfosInUI[0].chainId);
  // If edit mode, this will be equal or greater than 0.
  const [editIndex, setEditIndex] = useState(-1);

  const [name, setName] = useState("");

  const recipientConfig = useRecipientConfig(chainStore, chainId, {
    allowHexAddressToBech32Address:
      chainStore.hasModularChain(chainId) &&
      !chainStore.getModularChain(chainId).chainId.startsWith("injective"),
    icns: uiConfigStore.icnsInfo,
    ens: ENSInfo,
  });
  const recipientConfigForStarknet = useRecipientConfigForStarknet(
    chainStore,
    chainId
  );
  const recipientConfigForBitcoin = useRecipientConfigForBitcoin(
    chainStore,
    chainId
  );

  const memoConfig = useMemoConfig(chainStore, chainId);

  const [searchParams] = useSearchParams();
  // Param "chainId" is required.
  const paramChainId = searchParams.get("chainId");
  const paramEditIndex = searchParams.get("editIndex");

  const isStarknet =
    chainStore.hasModularChain(chainId) &&
    "starknet" in chainStore.getModularChain(chainId);

  const isBitcoin =
    chainStore.hasModularChain(chainId) &&
    "bitcoin" in chainStore.getModularChain(chainId);

  useEffect(() => {
    if (labelRef.current) {
      labelRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!paramChainId) {
      throw new Error(`Param "chainId" is required`);
    }

    setChainId(paramChainId);
    if (isStarknet) {
      recipientConfigForStarknet.setChain(paramChainId);
    } else if (isBitcoin) {
      recipientConfigForBitcoin.setChain(paramChainId);
    } else {
      recipientConfig.setChain(paramChainId);
    }
    memoConfig.setChain(paramChainId);

    if (paramEditIndex) {
      const index = Number.parseInt(paramEditIndex);
      const addressBook =
        uiConfigStore.addressBookConfig.getAddressBook(paramChainId);
      if (addressBook.length > index) {
        setEditIndex(index);
        const data = addressBook[index];
        setName(data.name);
        if (isStarknet) {
          recipientConfigForStarknet.setValue(data.address);
        } else if (isBitcoin) {
          recipientConfigForBitcoin.setValue(data.address);
        } else {
          recipientConfig.setValue(data.address);
        }
        memoConfig.setValue(data.memo);
        return;
      }
    }

    setEditIndex(-1);
  }, [
    intl,
    isBitcoin,
    isStarknet,
    memoConfig,
    paramChainId,
    paramEditIndex,
    recipientConfig,
    recipientConfigForBitcoin,
    recipientConfigForStarknet,
    uiConfigStore.addressBookConfig,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
    isIgnoringModularChain: isStarknet || isBitcoin,
  });

  const txConfigsValidateForStarknet = useTxConfigsValidateForStarknet({
    recipientConfig: recipientConfigForStarknet,
  });

  const txConfigsValidateForBitcoin = useTxConfigsValidateForBitcoin({
    recipientConfig: recipientConfigForBitcoin,
  });

  return (
    <HeaderLayout
      title={
        editIndex < 0
          ? intl.formatMessage({ id: "page.setting.contacts.add.add-title" })
          : intl.formatMessage({ id: "page.setting.contacts.add.edit-title" })
      }
      left={<BackButton />}
      onSubmit={(e) => {
        e.preventDefault();
        const internalRecipientConfig = (() => {
          if (isStarknet) {
            return recipientConfigForStarknet;
          } else if (isBitcoin) {
            return recipientConfigForBitcoin;
          }

          return recipientConfig;
        })();

        const address = (() => {
          if ("nameServiceResult" in internalRecipientConfig) {
            // name service fetch가 성공했을 경우 저장할때는 suffix까지 포함된 형태로 저장한다.
            const r = internalRecipientConfig.nameServiceResult;
            if (r.length > 0) {
              return r[0].fullName;
            }
          }

          return internalRecipientConfig.value;
        })();

        if (editIndex < 0) {
          uiConfigStore.addressBookConfig.addAddressBook(chainId, {
            name,
            address,
            memo: memoConfig.value,
          });
        } else {
          uiConfigStore.addressBookConfig.setAddressBookAt(chainId, editIndex, {
            name,
            address,
            memo: memoConfig.value,
          });
        }

        navigate(-1);
      }}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "button.confirm",
          }),
          color: "secondary",
          size: "large",
          type: "submit",
          disabled:
            (isStarknet
              ? txConfigsValidateForStarknet.interactionBlocked
              : txConfigsValidate.interactionBlocked) ||
            (isBitcoin
              ? txConfigsValidateForBitcoin.interactionBlocked
              : txConfigsValidate.interactionBlocked) ||
            name === "",
        },
      ]}
    >
      <Styles.Container gutter="1rem">
        <TextInput
          label={intl.formatMessage({
            id: "page.setting.contacts.add.label-label",
          })}
          ref={labelRef}
          value={name}
          placeholder={intl.formatMessage({
            id: "page.setting.contacts.add.label-placeholder",
          })}
          onChange={(e) => {
            e.preventDefault();

            setName(e.target.value);
          }}
        />
        {isStarknet ? (
          <RecipientInputForStarknet
            recipientConfig={recipientConfigForStarknet}
            hideAddressBookButton={true}
          />
        ) : isBitcoin ? (
          <RecipientInputForBitcoin
            recipientConfig={recipientConfigForBitcoin}
            hideAddressBookButton={true}
          />
        ) : (
          <RecipientInput
            recipientConfig={recipientConfig}
            hideAddressBookButton={true}
          />
        )}
        <MemoInput
          label={intl.formatMessage({
            id: "page.setting.contacts.add.memo-label",
          })}
          placeholder={intl.formatMessage({
            id: "page.setting.contacts.add.memo-placeholder",
          })}
          memoConfig={memoConfig}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
