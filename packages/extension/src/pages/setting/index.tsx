import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../layouts/header/components";
import { HeaderLayout } from "../../layouts/header";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { XAxis } from "../../components/axis";
import { Box } from "../../components/box";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();

  return (
    <HeaderLayout title="Setting" left={<BackButton />}>
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title={<XAxis alignY="center">General</XAxis>}
            paragraph="Language, Currency, Contacts..."
            startIcon={<SettingIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general")}
          />

          <PageButton
            title="Advanced"
            paragraph="Developer Mode, Change Endpoints..."
            startIcon={<RocketLaunchIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced")}
          />

          <PageButton
            title="Security & Privacy"
            paragraph="Connected Websites, Auto-Lock"
            startIcon={<KeyIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security")}
          />

          <PageButton
            title="Manage Token List"
            paragraph="Only for the tokens that are added manually via contract addresses"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/token/list")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
