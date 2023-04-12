import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { Stack } from "../../../components/stack";
import { Toggle } from "../../../components/toggle";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";

export const SettingAdvancedPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  const navigate = useNavigate();

  return (
    <HeaderLayout title="Advanced" left={<BackButton />}>
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title="Developer Mode"
            paragraph="Feeling techie today? :)"
            endIcon={
              <Toggle
                isOpen={uiConfigStore.isDeveloper}
                setIsOpen={() =>
                  uiConfigStore.setDeveloperMode(!uiConfigStore.isDeveloper)
                }
              />
            }
          />

          <PageButton
            title="Change Endpoints"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced/endpoint")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
