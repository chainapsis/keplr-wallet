import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { TextInput } from "../../../../components/input";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
  `,
};

export const SettingTokenAddPage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout title="Add Token" left={<BackButton />}>
      <form>
        <Styles.Container gutter="1rem">
          <TextInput label="Contract Address" />
          <TextInput label="Name" disabled />
          <TextInput label="Symbol" disabled />
          <TextInput label="Decimals" disabled />
        </Styles.Container>
      </form>
    </HeaderLayout>
  );
});
