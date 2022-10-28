import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { ColorPalette } from "../../../styles";

export const CreateAccountType = "new-mnemonic";

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

export const CreateAccount: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({}) => {
  return (
    <Stack gutter="2rem">
      <BackupWarning>
        <BackupWarningTitle>
          Backup your mnemonic seed securely.
        </BackupWarningTitle>
        <BackupWarningList>
          <li>Anyone with your mnemonic seed can take your assets.</li>
          <li>{"Lost mnemonic seed can't be recovered"}</li>
        </BackupWarningList>
      </BackupWarning>
      <BackupWarning>
        <BackupWarningTitle>
          Backup your mnemonic seed securely.
        </BackupWarningTitle>
        <BackupWarningList>
          <li>Anyone with your mnemonic seed can take your assets.</li>
          <li>{"Lost mnemonic seed can't be recovered"}</li>
        </BackupWarningList>
      </BackupWarning>
      <BackupWarning>
        <BackupWarningTitle>
          Backup your mnemonic seed securely.
        </BackupWarningTitle>
        <BackupWarningList>
          <li>Anyone with your mnemonic seed can take your assets.</li>
          <li>{"Lost mnemonic seed can't be recovered"}</li>
        </BackupWarningList>
      </BackupWarning>
      <BackupWarning>
        <BackupWarningTitle>
          Backup your mnemonic seed securely.
        </BackupWarningTitle>
        <BackupWarningList>
          <li>Anyone with your mnemonic seed can take your assets.</li>
          <li>{"Lost mnemonic seed can't be recovered"}</li>
        </BackupWarningList>
      </BackupWarning>
    </Stack>
  );
});
