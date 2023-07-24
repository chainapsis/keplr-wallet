import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";
import { useNavigate } from "react-router";
import { PageButton } from "./page-button";
import style from "./style.module.scss";
import { useLanguage } from "../../languages";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { userChatActive, userDetails } from "@chatStore/user-slice";
import { WalletConfig, walletConfig } from "@chatStore/user-slice";
import { useSelector } from "react-redux";
import { useStore } from "../../stores";

export const SettingPage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();

  const { accountStore, chainStore, keyRingStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const config: WalletConfig = useSelector(walletConfig);
  const userState = useSelector(userDetails);
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
  const user = useSelector(userDetails);
  const requiredNative = useSelector(userChatActive);
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
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        {(userState.messagingPubKey?.publicKey?.length ||
          userState.messagingPubKey?.privacySetting?.length) && (
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
          style={{ display: "none" }}
          onClick={() => {
            navigate("/setting/export-to-mobile");
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
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        {/*<PageButton
          title={intl.formatMessage({
            id: "setting.developer-mode",
          })}
          onClick={() => {
            uiConfigStore.setDeveloperMode(!isDeveloperMode);
          }}
          icons={[
            <label
              key="toggle"
              className="custom-toggle"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={isDeveloperMode}
                onChange={() => {
                  uiConfigStore.setDeveloperMode(isDeveloperMode);
                }}
              />
              <span className="custom-toggle-slider rounded-circle" />
            </label>,
          ]}
        /> */}
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
