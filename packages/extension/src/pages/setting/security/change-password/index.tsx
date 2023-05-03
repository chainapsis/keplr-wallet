import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { Body2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { TextInput } from "../../../../components/input";
import { Stack } from "../../../../components/stack";
import { Gutter } from "../../../../components/gutter";

export const SettingSecurityChangePasswordPage: FunctionComponent = observer(
  () => {
    return (
      <HeaderLayout
        title="Change Password"
        left={<BackButton />}
        bottomButton={{ text: "Next", color: "secondary", size: "large" }}
      >
        <Box paddingX="0.75rem">
          <Body2
            color={ColorPalette["gray-200"]}
            style={{
              textAlign: "center",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}
          >
            The password is for Keplr extension itself, not for each account.
            Therefore, you will need to type in the same password for unlocking
            the extension for different accounts.
          </Body2>
          <Gutter size="1.75rem" />

          <Stack gutter="1rem">
            <TextInput label="Password" />

            <TextInput label="New Keplr Password" />

            <TextInput label="Confirm New Keplr Password" />
          </Stack>
        </Box>
      </HeaderLayout>
    );
  }
);
