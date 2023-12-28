import React, {
  Component,
  ErrorInfo,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from './src/components/box';
import {Text} from 'react-native';
import {WarningFillIcon} from './src/components/icon';
import {useStyle} from './src/styles';
import {Gutter} from './src/components/gutter';
import {Button} from './src/components/button';
import {useStore} from './src/stores';
import {ClearAllIBCHistoryMsg} from '@keplr-wallet/background';
import {InExtensionMessageRequester} from '@keplr-wallet/router-extension';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {FormattedMessage, useIntl} from 'react-intl';
import {ErrorShutDownModal} from './src/components/modal/error-shutdown-modal';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return <ErrorBoundaryView />;
    }

    return this.props.children;
  }
}

export const ErrorBoundaryView: FunctionComponent = observer(() => {
  const {chainStore} = useStore();
  const style = useStyle();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenShutdownModal, setIsOpenShutDownModal] = useState(false);

  const resetStoreQueries = async () => {
    const clearStoreDatas = async () => {
      const prefixes = [
        'store_queries/',
        'store_prices/',
        'store_ibc_curreny_registrar/',
        'store_lsm_currency_registrar/',
        'store_gravity_bridge_currency_registrar/',
        'store_axelar_evm_bridge_currency_registrar/',
      ];

      const storageList = await browser.storage.local.get();
      const storeQueriesKeys = Object.keys(storageList).filter(key => {
        for (const prefix of prefixes) {
          if (key.startsWith(prefix)) {
            return true;
          }
        }
        return false;
      });
      await browser.storage.local.remove(storeQueriesKeys);
    };

    const clearAllIBCHistory = async () => {
      const msg = new ClearAllIBCHistoryMsg();
      const requester = new InExtensionMessageRequester();
      await requester.sendMessage(BACKGROUND_PORT, msg);
    };

    // TODO: 추후 진행
    // const fn3 = async () => {
    //   await uiConfigStore.removeStatesWhenErrorOccurredDuringRending();
    // };

    await Promise.allSettled([clearStoreDatas(), clearAllIBCHistory()]);
  };

  return (
    <Box
      style={{flex: 1}}
      alignX="center"
      alignY="center"
      paddingX={35}
      backgroundColor={style.get('color-gray-600').color}>
      <WarningFillIcon size={76} color={style.get('color-gray-10').color} />
      <Text style={style.flatten(['h1', 'color-white'])}>
        <FormattedMessage id="page.error-boundary.title" />
      </Text>

      <Gutter size={50} />

      <Text
        style={style.flatten([
          'subtitle4',
          'color-gray-200',
          'text-center',
          'padding-x-10',
        ])}>
        <FormattedMessage id="page.error-boundary.reset-cache-paragraph" />
      </Text>

      <Gutter size={16} />

      <Button
        text={intl.formatMessage({
          id: 'page.error-boundary.reset-cache-button',
        })}
        size="large"
        color="secondary"
        containerStyle={{width: '100%'}}
        onPress={async () => {
          if (isLoading) {
            return;
          }
          setIsOpenShutDownModal(true);

          setIsLoading(true);

          try {
            await resetStoreQueries();
          } finally {
            setIsLoading(false);
          }
        }}
      />

      <Gutter size={42} />

      <Text
        style={style.flatten([
          'subtitle4',
          'color-gray-200',
          'text-center',
          'padding-x-10',
        ])}>
        <FormattedMessage id="page.error-boundary.reset-cache-endpoints-paragraph" />
      </Text>

      <Gutter size={16} />

      <Button
        text={intl.formatMessage({
          id: 'page.error-boundary.reset-cache-endpoints-button',
        })}
        size="large"
        color="danger"
        containerStyle={{width: '100%', height: 72}}
        onPress={async () => {
          if (isLoading) {
            return;
          }
          setIsOpenShutDownModal(true);
          setIsLoading(true);

          try {
            await resetStoreQueries();

            await Promise.all([
              chainStore.clearAllChainEndpoints(),
              chainStore.clearClearAllSuggestedChainInfos(),
            ]);
          } finally {
            setIsLoading(false);
          }
        }}
      />
      <ErrorShutDownModal isOpen={isOpenShutdownModal} setIsOpen={() => {}} />
    </Box>
  );
});
