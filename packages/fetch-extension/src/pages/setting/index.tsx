import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";
import { useNavigate } from "react-router";
import { PageButton } from "./page-button";
import style from "./style.module.scss";
import { useLanguage } from "../../languages";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

interface WalletConfig {
  notiphyWhitelist: string[] | undefined;
  fetchbotActive: boolean;
  requiredNative: boolean;
}
export const SettingPage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();

  const { accountStore, chainStore, keyRingStore, chatStore, analyticsStore } =
    useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const config: WalletConfig = chatStore.userDetailsStore.walletConfig;
  const userState = chatStore.userDetailsStore;
  const paragraphLang = language.automatic
    ? intl.formatMessage(
        {
          id: "setting.language.automatic-with-language",
        },
        {
          language: intl.formatMessage({
            id: `setting.language.${language.language}`,
          }),
        }
      )
    : intl.formatMessage({
        id: `setting.language.${language.language}`,
      });

  const paragraphFiat = !language.isFiatCurrencyAutomatic
    ? language.fiatCurrency.toUpperCase()
    : intl.formatMessage(
        {
          id: "setting.fiat.automatic-with-fiat",
        },
        {
          fiat: language.fiatCurrency.toUpperCase(),
        }
      );
  const user = chatStore.userDetailsStore;
  const requiredNative = userState.walletConfig.requiredNative;
  const isChatActive = !requiredNative || user.hasFET;

  /// const isDeveloperMode = uiConfigStore.isDeveloper;

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.settings",
      })}
      onBackButton={() => {
        navigate(-1);
        analyticsStore.logEvent("back_click", { pageName: "Settings" });
      }}
    >
      <div className={style["container"]}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language",
          })}
          paragraph={paragraphLang}
          onClick={() => {
            navigate("/setting/language");
            analyticsStore.logEvent("language_click", {
              pageName: "Setting",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.fiat",
          })}
          paragraph={paragraphFiat}
          onClick={() => {
            navigate("/setting/fiat");
            analyticsStore.logEvent("currency_click", {
              pageName: "Setting",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.security-privacy",
          })}
          onClick={() => {
            navigate("/setting/security-privacy");
            analyticsStore.logEvent("security_and_privacy_click", {
              pageName: "Setting",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        {(userState.messagingPubKey?.publicKey ||
          userState.messagingPubKey?.privacySetting) && (
          <PageButton
            style={{
              cursor: isChatActive ? "pointer" : "not-allowed",
            }}
            paragraph={
              isChatActive ? "" : "You need FET balance to use this feature"
            }
            title={"Chat"}
            onClick={() => {
              if (isChatActive) navigate("/setting/chat");
              analyticsStore.logEvent("chat", { pageName: "Setting" });
            }}
            icons={useMemo(
              () => [<i key="next" className="fas fa-chevron-right" />],
              []
            )}
          />
        )}
        {keyRingStore.keyRingType !== "ledger" &&
          config.notiphyWhitelist &&
          (config.notiphyWhitelist.length === 0 ||
            config.notiphyWhitelist.indexOf(accountInfo.bech32Address) !==
              -1) && (
            <PageButton
              title={"Notifications"}
              onClick={() => {
                navigate("/setting/notifications");
                analyticsStore.logEvent("notifications_tab_click", {
                  pageName: "Setting",
                });
              }}
              icons={useMemo(
                () => [<i key="next" className="fas fa-chevron-right" />],
                []
              )}
            />
          )}

        <PageButton
          title={intl.formatMessage({
            id: "setting.export-to-mobile",
          })}
          onClick={() => {
            navigate("/setting/export-to-mobile");
            analyticsStore.logEvent("link_fetch_mobile_wallet_click", {
              pageName: "Setting",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.chain-active.title",
          })}
          onClick={() => {
            navigate("/setting/chain-active");
            analyticsStore.logEvent("show_hide_chains_click", {
              pageName: "Setting",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.endpoints",
          })}
          paragraph={intl.formatMessage({
            id: "setting.endpoints.paragraph",
          })}
          onClick={() => {
            navigate("/setting/endpoints");
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
      </div>
    </HeaderLayout>
  );
});
