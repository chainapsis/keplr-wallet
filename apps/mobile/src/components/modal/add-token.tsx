import {registerCardModal} from './card';
import {observer} from 'mobx-react-lite';
import {Box} from '../box';
import {useStore} from '../../stores';
import {BaseModalHeader} from './modal';
import React from 'react';
import {useIntl} from 'react-intl';
import {Gutter} from '../gutter';
import {TextInput} from '../input';
import {Button} from '../button';
import {XAxis} from '../axis';
import {AppCurrency} from '@keplr-wallet/types';

export const AddTokenModal = registerCardModal(
  observer(() => {
    const intl = useIntl();
    const {chainStore, queriesStore, tokensStore} = useStore();

    const chainId = tokensStore.waitingSuggestedToken?.data.chainId;
    const contractAddress =
      tokensStore.waitingSuggestedToken?.data.contractAddress;

    const queryContract = (() => {
      if (chainId && contractAddress) {
        const isSecretWasm = chainStore
          .getChain(chainId)
          .hasFeature('secretwasm');

        if (isSecretWasm) {
          return queriesStore
            .get(chainId)
            .secret.querySecret20ContractInfo.getQueryContract(contractAddress);
        } else {
          return queriesStore
            .get(chainId)
            .cosmwasm.querycw20ContractInfo.getQueryContract(contractAddress);
        }
      }

      return undefined;
    })();

    return (
      <Box paddingX={12} paddingBottom={12}>
        <BaseModalHeader
          title={intl.formatMessage({id: 'components.add-token-modal.title'})}
        />

        <Gutter size={16} />

        {queryContract ? (
          <React.Fragment>
            <TextInput
              label={intl.formatMessage({
                id: 'page.setting.token.add.contract-address-label',
              })}
              isLoading={queryContract.isFetching}
              disabled
              value={contractAddress}
            />

            <Gutter size={16} />

            <TextInput
              label={intl.formatMessage({
                id: 'page.setting.token.add.name-label',
              })}
              disabled
              value={queryContract.tokenInfo?.name || '-'}
            />

            <Gutter size={16} />

            <TextInput
              label={intl.formatMessage({
                id: 'page.setting.token.add.symbol-label',
              })}
              value={queryContract.tokenInfo?.symbol || '-'}
              disabled
            />

            <Gutter size={16} />

            <TextInput
              label={intl.formatMessage({
                id: 'page.setting.token.add.decimal-label',
              })}
              value={queryContract.tokenInfo?.decimals.toString() || '-'}
              disabled
            />

            <Gutter size={16} />

            {tokensStore.waitingSuggestedToken?.data.viewingKey ? (
              <TextInput
                label={intl.formatMessage({
                  id: 'page.setting.token.add.viewing-key-label',
                })}
                value={tokensStore.waitingSuggestedToken.data.viewingKey}
                disabled
              />
            ) : null}
          </React.Fragment>
        ) : null}

        <XAxis>
          <Button
            size="large"
            text={intl.formatMessage({id: 'button.reject'})}
            color="secondary"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              await tokensStore.rejectAllSuggestedTokens();
            }}
          />

          <Gutter size={16} />

          <Button
            size="large"
            text={intl.formatMessage({id: 'button.approve'})}
            containerStyle={{flex: 1, width: '100%'}}
            onPress={async () => {
              if (
                tokensStore.waitingSuggestedToken &&
                chainId &&
                contractAddress &&
                queryContract?.tokenInfo
              ) {
                const isSecretWasm = chainStore
                  .getChain(chainId)
                  .hasFeature('secretwasm');

                let currency: AppCurrency;

                if (isSecretWasm) {
                  currency = {
                    type: 'secret20',
                    contractAddress,
                    viewingKey:
                      tokensStore.waitingSuggestedToken?.data.viewingKey ?? '',
                    coinMinimalDenom: queryContract.tokenInfo.name,
                    coinDenom: queryContract.tokenInfo.symbol,
                    coinDecimals: queryContract.tokenInfo.decimals,
                  };
                } else {
                  currency = {
                    type: 'cw20',
                    contractAddress,
                    coinMinimalDenom: queryContract.tokenInfo.name,
                    coinDenom: queryContract.tokenInfo.symbol,
                    coinDecimals: queryContract.tokenInfo.decimals,
                  };
                }

                await tokensStore.approveSuggestedTokenWithProceedNext(
                  tokensStore.waitingSuggestedToken.id,
                  currency,
                  () => {},
                );
              }
            }}
          />
        </XAxis>
      </Box>
    );
  }),
);
