import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { TextInput } from "../../../../components/input";
import { Button } from "../../../../components/button";
import { useSearchParams } from "react-router-dom";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
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
    >
      <form>
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

        <Styles.BottomButton>
          <Button text="Confirm" color="secondary" />
        </Styles.BottomButton>
      </form>
    </HeaderLayout>
  );
});
