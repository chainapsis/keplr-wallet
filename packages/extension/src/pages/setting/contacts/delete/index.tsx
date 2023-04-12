import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { TextInput } from "../../../../components/input";
import { Button } from "../../../../components/button";
import { GuideBox } from "../../../../components/guide-box";
import { Body3, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  Bold: styled.span`
    color: ${ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Subtitle3)`
    padding: 0 0.5rem;
    text-align: center;
    color: ${ColorPalette["gray-200"]};
  `,
  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
  `,
};

export const SettingContactsDelete: FunctionComponent = observer(() => {
  return (
    <HeaderLayout title="Delete Address" left={<BackButton />}>
      <Styles.Container gutter="1rem">
        <GuideBox
          title="Mnemonic"
          paragraph={
            <Body3>
              Make sure you’ve backed up your mnemonic seed before proceeding.
              &nbsp;<Styles.Bold>Back- Up Account</Styles.Bold>
            </Body3>
          }
        />
        <Styles.Paragraph>
          By deleting your account, you will no longer have access to your
          account on Keplr.
        </Styles.Paragraph>
        <TextInput label="Password" type="password" />
      </Styles.Container>

      <Styles.BottomButton>
        <Button text="Confirm" color="secondary" />
      </Styles.BottomButton>
    </HeaderLayout>
  );
});
