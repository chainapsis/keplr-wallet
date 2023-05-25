import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { RecipientInput, TextInput } from "../../../../components/input";
import { useSearchParams } from "react-router-dom";
import {
  useMemoConfig,
  useRecipientConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { MemoInput } from "../../../../components/input/memo-input";
import { useNavigate } from "react-router";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();
  const navigate = useNavigate();

  const [chainId, setChainId] = useState(chainStore.chainInfosInUI[0].chainId);
  // If edit mode, this will be equal or greater than 0.
  const [editIndex, setEditIndex] = useState(-1);

  const [name, setName] = useState("");

  const recipientConfig = useRecipientConfig(chainStore, chainId, {
    allowHexAddressOnEthermint: true,
    icns: uiConfigStore.icnsInfo,
  });
  const memoConfig = useMemoConfig(chainStore, chainId);

  const [searchParams] = useSearchParams();
  // Param "chainId" is required.
  const paramChainId = searchParams.get("chainId");
  const paramEditIndex = searchParams.get("editIndex");
  useEffect(() => {
    if (!paramChainId) {
      throw new Error(`Param "chainId" is required`);
    }

    setChainId(paramChainId);
    recipientConfig.setChain(paramChainId);
    memoConfig.setChain(paramChainId);

    if (paramEditIndex) {
      const index = Number.parseInt(paramEditIndex);
      const addressBook =
        uiConfigStore.addressBookConfig.getAddressBook(paramChainId);
      if (addressBook.length > index) {
        setEditIndex(index);
        const data = addressBook[index];
        setName(data.name);
        recipientConfig.setValue(data.address);
        memoConfig.setValue(data.memo);
        return;
      }
    }

    setEditIndex(-1);
  }, [
    memoConfig,
    paramChainId,
    paramEditIndex,
    recipientConfig,
    uiConfigStore.addressBookConfig,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
  });

  return (
    <HeaderLayout
      title={`${editIndex < 0 ? "Add" : "Edit"} Contact`}
      left={<BackButton />}
      onSubmit={(e) => {
        e.preventDefault();

        if (editIndex < 0) {
          uiConfigStore.addressBookConfig.addAddressBook(chainId, {
            name,
            address: recipientConfig.value,
            memo: memoConfig.value,
          });
        } else {
          uiConfigStore.addressBookConfig.setAddressBookAt(chainId, editIndex, {
            name,
            address: recipientConfig.value,
            memo: memoConfig.value,
          });
        }

        navigate(-1);
      }}
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        disabled: txConfigsValidate.interactionBlocked || name === "",
      }}
    >
      <Styles.Container gutter="1rem">
        <TextInput
          label="Label"
          value={name}
          placeholder="A short nickname to identify the contact"
          onChange={(e) => {
            e.preventDefault();

            setName(e.target.value);
          }}
        />
        <RecipientInput
          recipientConfig={recipientConfig}
          hideAddressBookButton={true}
        />
        <MemoInput
          label="Memo (Optional)"
          placeholder="Required for sending to centralized exchange"
          memoConfig={memoConfig}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
