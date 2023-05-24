import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { Stack } from "../../../components/stack";
import { PageButton } from "../components";
import { RightArrowIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Box } from "../../../components/box";
import { useLanguage } from "../../../languages";
import { useIntl } from "react-intl";

export const SettingGeneralPage: FunctionComponent = observer(() => {
  const { keyRingStore, uiConfigStore } = useStore();
  const intl = useIntl();

  const language = useLanguage();

  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "pages.setting.general.header",
      })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.language-button",
            })}
            paragraph={language.languageFullName}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/language")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.currency-button",
            })}
            paragraph={(() => {
              const fiatCurrency = uiConfigStore.fiatCurrency;
              if (fiatCurrency.isAutomatic) {
                return intl.formatMessage(
                  {
                    id: "pages.setting.general.currency-automatic-paragraph",
                  },
                  { currency: fiatCurrency.currency.toUpperCase() }
                );
              }

              return uiConfigStore.fiatCurrency.currency.toUpperCase();
            })()}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/fiat")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.contacts-button",
            })}
            paragraph="4"
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/contacts/list")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.manage-authz-button",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/authz")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.link-mobile-button",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/link-keplr-mobile")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.manage-suggest-chain-button",
            })}
            paragraph={intl.formatMessage({
              id: "pages.setting.general.manage-suggest-chain-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/delete-suggest-chain")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "pages.setting.general.manage-chain-button",
            })}
            paragraph={intl.formatMessage({
              id: "pages.setting.general.manage-chain-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => {
              if (keyRingStore.selectedKeyInfo) {
                browser.tabs
                  .create({
                    url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                  })
                  .then(() => {
                    window.close();
                  });
              }
            }}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
