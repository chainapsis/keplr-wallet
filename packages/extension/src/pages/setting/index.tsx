import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../layouts/header/components";
import { HeaderLayout } from "../../layouts/header";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import { SettingIcon, RightArrowIcon } from "../../components/icon";
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
            paragraph="Language, Currency.."
            startIcon={<SettingIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general")}
          />

          <PageButton
            title="Advanced"
            paragraph="Developer Mode, Endpoints"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced")}
          />

          <PageButton
            title="Security & Privacy"
            paragraph="Language, Currency.."
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
