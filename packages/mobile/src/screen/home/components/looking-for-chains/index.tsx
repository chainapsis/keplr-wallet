import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {TokenTitleView} from '../token';
import {Stack} from '../../../../components/stack';
import {useStyle} from '../../../../styles';
import {ChainInfo} from '@keplr-wallet/types';
import {Gutter} from '../../../../components/gutter';
import {ChainImageFallback} from '../../../../components/image';
import {Column, Columns} from '../../../../components/column';
import {YAxis} from '../../../../components/axis';
import {Button} from '../../../../components/button';
import {observer} from 'mobx-react-lite';
import {useIntl} from 'react-intl';
import {Text} from 'react-native';

export const LookingForChains: FunctionComponent<{
  chainInfos: ChainInfo[];
}> = ({chainInfos}) => {
  const intl = useIntl();

  return (
    <Box>
      <TokenTitleView
        title={intl.formatMessage({
          id: 'page.main.components.looking-for-chains.title',
        })}
      />

      <Gutter size={16} />

      <Stack>
        {chainInfos.map(chainInfo => (
          <LookingForChainItem key={chainInfo.chainId} chainInfo={chainInfo} />
        ))}
      </Stack>
    </Box>
  );
};

export const LookingForChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
}> = observer(({chainInfo}) => {
  // const {keyRingStore} = useStore();
  const style = useStyle();

  return (
    <Box
      backgroundColor={style.get('color-gray-600@60%').color}
      paddingX={16}
      paddingY={14}
      borderRadius={6}>
      <Columns sum={1} gutter={8} alignY="center">
        <ChainImageFallback
          style={{
            width: '2rem',
            height: '2rem',
            opacity: '0.6',
          }}
          src={chainInfo.chainSymbolImageUrl}
          alt={`${chainInfo.chainSymbolImageUrl} ${chainInfo.chainName}`}
        />

        <Gutter size={10} />

        <YAxis>
          <Text style={style.flatten(['subtitle2', 'color-gray-10@60%'])}>
            {chainInfo.chainName}
          </Text>

          <Gutter size={4} />

          <Text style={style.flatten(['color-gray-300@60%'])}>
            {chainInfo.stakeCurrency?.coinDenom ||
              chainInfo.currencies[0].coinDenom}
          </Text>
        </YAxis>

        <Column weight={1} />

        <Button
          text="Manage"
          size="small"
          color="secondary"
          onPress={() => {
            //TODO 아래 로직을 이후 레지스터에 맞게 수정해야됨
            // if (keyRingStore.selectedKeyInfo) {
            //   analyticsStore.logEvent('click_enableChain', {
            //     chainId: chainInfo.chainId,
            //     chainName: chainInfo.chainName,
            //   });
            //   browser.tabs
            //     .create({
            //       url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true&initialSearchValue=${chainInfo.chainName}`,
            //     })
            //     .then(() => {
            //       window.close();
            //     });
            // }
          }}
        />
      </Columns>
    </Box>
  );
});
