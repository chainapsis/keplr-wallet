import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";
import { useHistory } from "react-router";
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
  // const { uiConfigStore } = useStore();

  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  const { accountStore, chainStore } = useStore();
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
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.settings",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language",
          })}
          paragraph={paragraphLang}
          onClick={() => {
            history.push({
              pathname: "/setting/language",
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
            history.push({
              pathname: "/setting/fiat",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.connections",
          })}
          paragraph={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/connections",
            });
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
              if (isChatActive)
                history.push({
                  pathname: "/setting/chat",
                });
            }}
            icons={useMemo(
              () => [<i key="next" className="fas fa-chevron-right" />],
              []
            )}
          />
        )}
        {config.notiphyWhitelist !== undefined &&
          config.notiphyWhitelist.length !== 0 &&
          config.notiphyWhitelist.indexOf(accountInfo.bech32Address) !== -1 && (
            <PageButton
              title={"Notifications"}
              onClick={() => {
                history.push({
                  pathname: "/setting/notifications",
                });
              }}
              icons={useMemo(
                () => [<i key="next" className="fas fa-chevron-right" />],
                []
              )}
            />
          )}
        {/* <PageButton
          title="Show Advanced IBC Transfers"
          onClick={() => {
            uiConfigStore.setShowAdvancedIBCTransfer(
              !uiConfigStore.showAdvancedIBCTransfer
            );
          }}
          icons={[
            <label
              key="toggle"
              className="custom-toggle"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={uiConfigStore.showAdvancedIBCTransfer}
                onChange={() => {
                  uiConfigStore.setShowAdvancedIBCTransfer(
                    !uiConfigStore.showAdvancedIBCTransfer
                  );
                }}
              />
              <span className="custom-toggle-slider rounded-circle" />
            </label>,
          ]}
        /> */}
        <PageButton
          title={intl.formatMessage({
            id: "setting.credit",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/credit",
            });
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
