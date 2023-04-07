import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { TextInput } from "../../../../components/input";
import { Button } from "../../../../components/button";

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

export const SettingAddressBookEdit: FunctionComponent = observer(() => {
  return (
    <HeaderLayout title="Edit Address" left={<BackButton />}>
      <Styles.Container gutter="1rem">
        <TextInput label="Name" />
        <TextInput label="Address" />
        <TextInput label="Memo(Option)" />
      </Styles.Container>

      <Styles.BottomButton>
        <Button text="Confirm" color="secondary" />
      </Styles.BottomButton>
    </HeaderLayout>
  );
});
