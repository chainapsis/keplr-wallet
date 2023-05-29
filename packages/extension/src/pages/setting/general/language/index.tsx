import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { PageButton } from "../../components";
import { CheckIcon } from "../../../../components/icon";
import { FormattedMessage } from "react-intl";
import { useLanguage } from "../../../../languages";
import { useNavigate } from "react-router";

export const SettingGeneralLanguagePage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={<FormattedMessage id="setting.language" />}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title="Automatic (Browser default)"
            endIcon={
              language.automatic ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              language.clearLanguage();
              navigate(-1);
            }}
          />
          <PageButton
            title="English"
            endIcon={
              !language.automatic && language.language === "en" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              language.setLanguage("en");
              navigate(-1);
            }}
          />
          <PageButton
            title="Korean"
            endIcon={
              !language.automatic && language.language === "ko" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              language.setLanguage("ko");
              navigate(-1);
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
