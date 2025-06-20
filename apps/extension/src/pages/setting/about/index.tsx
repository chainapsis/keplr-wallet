import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { Stack } from "../../../components/stack";
import { useIntl } from "react-intl";

export const AboutKeplrPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.about.title" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.about.website",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => {
              browser.tabs.create({
                url: "https://keplr.app",
              });
            }}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.about.terms-of-use",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => {
              browser.tabs.create({
                url: "https://terms-of-use.keplr.app/",
              });
            }}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.about.privacy-policy",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => {
              browser.tabs.create({
                url: "https://privacy-policy.keplr.app/",
              });
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
