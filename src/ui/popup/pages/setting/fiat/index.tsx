import React, { FunctionComponent, useCallback, useMemo } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { PageButton } from "../page-button";

import style from "../style.module.scss";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { FiatCurrencies } from "../../../../../config";
import {
  getManualFiatCurrency,
  setManualFiatCurrency
} from "../../../../../common/currency";

export const SettingFiatPage: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();

  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  const manualFiat = getManualFiatCurrency();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.fiat"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.fiat.automatic"
          })}
          onClick={() => {
            setManualFiatCurrency(null);
            history.push({
              pathname: "/"
            });
          }}
          icons={!manualFiat ? selectedIcon : undefined}
        />
        {Object.keys(FiatCurrencies).map(currency => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fiatCurrency = FiatCurrencies[currency]!;

          return (
            <PageButton
              key={fiatCurrency.currency}
              title={`${fiatCurrency.currency.toUpperCase()} (${
                fiatCurrency.symbol
              })`}
              onClick={() => {
                setManualFiatCurrency(fiatCurrency);
                history.push({
                  pathname: "/"
                });
              }}
              icons={
                manualFiat
                  ? manualFiat.currency === fiatCurrency.currency
                    ? selectedIcon
                    : undefined
                  : undefined
              }
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
};
