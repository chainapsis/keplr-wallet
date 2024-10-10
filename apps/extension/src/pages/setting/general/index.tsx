import React, { FunctionComponent, useEffect, useState } from "react";
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
import { Toggle } from "../../../components/toggle";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { Subtitle2 } from "../../../components/typography";
import { toggleSidePanelMode } from "../../../utils";

export const SettingGeneralPage: FunctionComponent = observer(() => {
  const { keyRingStore, uiConfigStore } = useStore();

  const intl = useIntl();
  const language = useLanguage();

  const navigate = useNavigate();

  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false);
  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general-title" })}
      left={<BackButton />}
    >
      <Box padding="0.75rem" paddingTop="0">
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.language-title",
            })}
            paragraph={language.languageFullName}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/language")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.currency-title",
            })}
            paragraph={(() => {
              return uiConfigStore.fiatCurrency.currency.toUpperCase();
            })()}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/fiat")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.contacts-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/contacts/list")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.theme-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/theme")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.manage-authz-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/authz")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.link-kpelr-mobile-title",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/link-keplr-mobile")}
          />

          {sidePanelSupported ? (
            <PageButton
              title={
                <Subtitle2>
                  {intl.formatMessage({
                    id: "page.setting.general.side-panel-title",
                  })}
                </Subtitle2>
              }
              paragraph={intl.formatMessage({
                id: "page.setting.general.side-panel-paragraph",
              })}
              endIcon={
                <Toggle
                  isOpen={sidePanelEnabled}
                  setIsOpen={() => {
                    toggleSidePanelMode(!sidePanelEnabled, (res) =>
                      setSidePanelEnabled(res)
                    );
                  }}
                />
              }
            />
          ) : null}

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.show-24h-price-changes-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.general.show-24h-price-changes-paragraph",
            })}
            endIcon={
              <Toggle
                isOpen={uiConfigStore.show24HChangesInMagePage}
                setIsOpen={() => uiConfigStore.toggleShow24HChangesInMagePage()}
              />
            }
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.manage-non-native-chains-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.general.manage-non-native-chains-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general/delete-suggest-chain")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.general.manage-chain-visibility-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.general.manage-chain-visibility-paragraph",
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
