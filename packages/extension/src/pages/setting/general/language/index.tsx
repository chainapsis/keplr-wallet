import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { PageButton } from "../../components";
import { CheckIcon } from "../../../../components/icon";
import { useIntl } from "react-intl";
import { useLanguage } from "../../../../languages";
import { useNavigate } from "react-router";

export const SettingGeneralLanguagePage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general.language-title" })}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem" paddingBottom="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.language.automatic-title",
            })}
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
            title={language.getLanguageFullName("en")}
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
            title={language.getLanguageFullName("ko")}
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
          <PageButton
            title={language.getLanguageFullName("zh-cn")}
            endIcon={
              !language.automatic && language.language === "zh-cn" ? (
                <CheckIcon width="1.25rem" height="1.25rem" />
              ) : null
            }
            onClick={() => {
              language.setLanguage("zh-cn");
              navigate(-1);
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
