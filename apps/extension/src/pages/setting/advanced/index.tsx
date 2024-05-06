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
import { useIntl } from "react-intl";

export const SettingAdvancedPage: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();
  const intl = useIntl();

  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.advanced-title" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.advanced.developer-mode-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.advanced.developer-mode-paragraph",
            })}
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
            title={intl.formatMessage({
              id: "page.setting.advanced.change-endpoints-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced/endpoint")}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
