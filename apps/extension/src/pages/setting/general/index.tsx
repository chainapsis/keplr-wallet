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
  SetSidePanelEnabledMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

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
              title={intl.formatMessage({
                id: "page.setting.general.side-panel-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.setting.general.side-panel-paragraph",
              })}
              endIcon={
                <Toggle
                  isOpen={sidePanelEnabled}
                  setIsOpen={() => {
                    const msg = new SetSidePanelEnabledMsg(!sidePanelEnabled);
                    new InExtensionMessageRequester()
                      .sendMessage(BACKGROUND_PORT, msg)
                      .then((res) => {
                        setSidePanelEnabled(res.enabled);

                        if (res.enabled) {
                          if (
                            typeof chrome !== "undefined" &&
                            typeof chrome.sidePanel !== "undefined"
                          ) {
                            (async () => {
                              const selfCloseId = Math.random() * 100000;
                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
                              window.__self_id_for_closing_view_side_panel =
                                selfCloseId;
                              // side panel을 열고 나서 기존의 popup view를 모두 지워야한다
                              const viewsBefore = browser.extension.getViews();

                              try {
                                const activeTabs = await browser.tabs.query({
                                  active: true,
                                  currentWindow: true,
                                });
                                if (activeTabs.length > 0) {
                                  const id = activeTabs[0].id;
                                  if (id != null) {
                                    await chrome.sidePanel.open({
                                      tabId: id,
                                    });
                                  }
                                }
                              } catch (e) {
                                console.log(e);
                              } finally {
                                for (const view of viewsBefore) {
                                  if (
                                    // 자기 자신은 제외해야한다.
                                    // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    window.__self_id_for_closing_view_side_panel !==
                                    selfCloseId
                                  ) {
                                    view.window.close();
                                  }
                                }

                                window.close();
                              }
                            })();
                          } else {
                            window.close();
                          }
                        } else {
                          const selfCloseId = Math.random() * 100000;
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          window.__self_id_for_closing_view_side_panel =
                            selfCloseId;
                          // side panel을 모두 닫아야한다.
                          const views = browser.extension.getViews();

                          for (const view of views) {
                            if (
                              // 자기 자신은 제외해야한다.
                              // 다른거 끄기 전에 자기가 먼저 꺼지면 안되기 때문에...
                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
                              window.__self_id_for_closing_view_side_panel !==
                              selfCloseId
                            ) {
                              view.window.close();
                            }
                          }

                          window.close();
                        }
                      });
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
