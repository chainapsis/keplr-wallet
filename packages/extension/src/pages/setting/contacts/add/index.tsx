import React, { FunctionComponent, useState } from "react";
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

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();

  // TODO: Edit에 대해서도 처리하기
  const [searchParams] = useSearchParams();
  const isAdd =
    searchParams.get("name") === null && searchParams.get("address") === null;

  const [name, setName] = useState("");

  // TODO: 여기서 체인 선택이 들어가야한다.
  const recipientConfig = useRecipientConfig(chainStore, "cosmoshub", {
    allowHexAddressOnEthermint: true,
    icns: uiConfigStore.icnsInfo,
  });
  const memoConfig = useMemoConfig(chainStore, "cosmoshub");

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
  });

  return (
    <HeaderLayout
      title={`${isAdd ? "Add" : "Edit"} Address`}
      left={<BackButton />}
      onSubmit={(e) => {
        e.preventDefault();

        // TODO: 이거 하고 나서 어디 페이지로 보내든지 해야한다.
        uiConfigStore.addressBookConfig.addAddressBook("cosmoshub", {
          name,
          address: recipientConfig.value,
          memo: memoConfig.value,
        });
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
          label="Name"
          value={name}
          onChange={(e) => {
            e.preventDefault();

            setName(e.target.value);
          }}
        />
        {/* TODO: Address book 버튼을 안보이게 하는 prop 추가하기 */}
        <RecipientInput recipientConfig={recipientConfig} />
        <MemoInput memoConfig={memoConfig} />
      </Styles.Container>
    </HeaderLayout>
  );
});
