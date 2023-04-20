import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { TextInput } from "../../../../components/input";
import { useSearchParams } from "react-router-dom";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingContactsAdd: FunctionComponent = observer(() => {
  const [searchParams] = useSearchParams();
  const isAdd =
    searchParams.get("name") === null && searchParams.get("address") === null;

  return (
    <HeaderLayout
      title={`${isAdd ? "Add" : "Edit"} Address`}
      left={<BackButton />}
      bottomButton={{ text: "Confirm", color: "secondary", size: "large" }}
    >
      <Styles.Container gutter="1rem">
        <TextInput
          label="Name"
          value={searchParams.get("name") ?? ""}
          onChange={() => {}}
        />
        <TextInput
          label="Address"
          value={searchParams.get("address") ?? ""}
          onChange={() => {}}
        />
        <TextInput
          label="Memo(Option)"
          value={searchParams.get("memo") ?? ""}
          onChange={() => {}}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
