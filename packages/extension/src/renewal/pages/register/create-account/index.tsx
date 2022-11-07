import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { ButtonSelect } from "../../../components/button-select";
import { Input } from "../../../components/input";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";
import { NumWords, useNewMnemonicConfig } from "./hook";

export const CreateAccountType = "new-mnemonic";

export const CreateAccount: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();
  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

  return (
    <Stack gutter="2rem" alignItems="center">
      <Title>
        {intl.formatMessage({
          id: "register.create.title",
        })}
      </Title>
      <BackupWarning>
        <BackupWarningTitle>
          Backup your mnemonic seed securely.
        </BackupWarningTitle>
        <BackupWarningList>
          <li>Anyone with your mnemonic seed can take your assets.</li>
          <li>{"Lost mnemonic seed can't be recovered"}</li>
        </BackupWarningList>
      </BackupWarning>
      <ButtonSelect<NumWords>
        items={[
          {
            id: NumWords.WORDS12,
            label: intl.formatMessage({
              id: "register.create.toggle.word12",
            }),
          },
          {
            id: NumWords.WORDS24,
            label: intl.formatMessage({
              id: "register.create.toggle.word24",
            }),
          },
        ]}
        activeItemId={newMnemonicConfig.numWords}
        onClickItem={(itemId: NumWords) =>
          newMnemonicConfig.setNumWords(itemId)
        }
      />
      {newMnemonicConfig.mnemonic.split(" ").map((mnemonicWord, index) => (
        <Input
          key={index}
          label={`${index + 1}.`}
          value={mnemonicWord}
          isInline
          isUneditable
        />
      ))}
    </Stack>
  );
});

const BackupWarning = styled.div`
  padding: 28px 32px;
  background-color: ${ColorPalette["red-50"]};
  border: 1.4px solid ${ColorPalette["red-300"]};
  border-radius: 16px;
`;
const BackupWarningTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  line-height: 23px;
  color: ${ColorPalette["red-300"]};
`;

const BackupWarningList = styled.ul`
  font-weight: 400;
  font-size: 16.7707px;
  line-height: 23px;
  color: ${ColorPalette["red-300"]};
`;

const Title = styled.h1`
  font-weight: 600;
  font-size: 32px;
  line-height: 44px;
  text-align: center;
  color: ${ColorPalette["platinum-500"]};
`;
