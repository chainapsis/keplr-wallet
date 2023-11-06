import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {ChainInfo} from '@keplr-wallet/types';

import {FormattedMessage} from 'react-intl';
import {useStore} from '../../../../../stores';
import {Box} from '../../../../../components/box';
import {Stack} from '../../../../../components/stack';
import {Gutter} from '../../../../../components/gutter';
import {EmptyView} from '../../../../../components/empty-view';
import {Text} from 'react-native';
import {useStyle} from '../../../../../styles';
import {Column, Columns} from '../../../../../components/column';
import {ChainImageFallback} from '../../../../../components/image';
import {CloseIcon} from '../../../../../components/icon';
import {PageWithScrollView} from '../../../../../components/page';
import {InformationOutlinedIcon} from '../../../../../components/icon/information-outlined';

export const SettingGeneralManageSuggestChainScreen: FunctionComponent =
  observer(() => {
    const style = useStyle();
    const {chainStore} = useStore();
    const suggestedChains = chainStore.chainInfos.filter(
      chainInfo => !chainInfo.embedded.embedded,
    );
    return (
      <PageWithScrollView
        backgroundMode="default"
        style={style.flatten(['padding-x-12'])}
        contentContainerStyle={style.flatten(['flex-grow-1'])}>
        {suggestedChains.length ? (
          <Stack gutter={8}>
            {suggestedChains.map(chainInfo => {
              return (
                <ChainItem
                  key={chainInfo.chainIdentifier}
                  chainInfo={chainInfo}
                  onClickClose={() => {
                    chainStore.removeChainInfo(chainInfo.chainIdentifier);
                  }}
                />
              );
            })}
          </Stack>
        ) : (
          <Box alignX="center" alignY="center">
            <Gutter size={76} />
            <EmptyView>
              <Text style={style.flatten(['subtitle3', 'color-gray-400'])}>
                <FormattedMessage id="page.setting.general.delete-suggest-chain.empty-text" />
              </Text>
            </EmptyView>
          </Box>
        )}
      </PageWithScrollView>
    );
  });

const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
  onClickClose?: () => void;
}> = ({chainInfo, onClickClose}) => {
  const style = useStyle();

  return (
    <Box
      backgroundColor={style.get('color-gray-600').color}
      borderRadius={6}
      paddingX={16}
      paddingY={16}>
      <Columns sum={1} alignY="center" gutter={6}>
        <Box borderRadius={24}>
          <ChainImageFallback
            style={{width: 48, height: 48}}
            alt={`${chainInfo.chainId}-${chainInfo.chainName}-image`}
            src={chainInfo.chainSymbolImageUrl}
          />
        </Box>
        <Stack gutter={6}>
          <Columns sum={1} alignY="center" gutter={2}>
            <Text style={style.flatten(['body1', 'color-text-high'])}>
              {chainInfo.chainName}
            </Text>
            <InformationOutlinedIcon
              size={20}
              color={style.get('color-text-low').color}
            />
          </Columns>
          <Text style={style.flatten(['body3', 'color-text-low'])}>
            {chainInfo.currencies[0].coinDenom}
          </Text>
        </Stack>

        <Column weight={1} />

        <Box onClick={onClickClose} cursor="pointer">
          <CloseIcon size={24} color={style.get('color-text-low').color} />
        </Box>
      </Columns>
    </Box>
  );
};
