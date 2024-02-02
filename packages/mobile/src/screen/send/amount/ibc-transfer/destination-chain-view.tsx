import React, {FunctionComponent} from 'react';
import {IIBCChannelConfig} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {useStyle} from '../../../../styles';
import {useIntl} from 'react-intl';
import {Label} from '../../../../components/input/label';
import {XAxis} from '../../../../components/axis';
import {ChainImageFallback} from '../../../../components/image';
import {Gutter} from '../../../../components/gutter';
import {Text} from 'react-native';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {RectButton} from '../../../../components/rect-button';

export const DestinationChainView: FunctionComponent<{
  ibcChannelConfig: IIBCChannelConfig;
  onPress: () => void;
}> = observer(({ibcChannelConfig, onPress}) => {
  const {chainStore} = useStore();

  const intl = useIntl();
  const style = useStyle();

  return (
    <React.Fragment>
      <Label
        content={intl.formatMessage({
          id: 'page.send.amount.ibc-transfer.destination-chain',
        })}
      />

      <RectButton
        activeOpacity={1}
        onPress={onPress}
        style={style.flatten([
          'min-height-74',
          'justify-center',
          'padding-16',
          'border-radius-6',
          'background-color-card-default',
        ])}
        rippleColor={style.get('color-card-pressing-default').color}
        underlayColor={style.get('color-card-pressing-default').color}>
        <XAxis alignY="center">
          {ibcChannelConfig.channels.length === 0 ? null : (
            <React.Fragment>
              <ChainImageFallback
                style={{
                  width: 32,
                  height: 32,
                }}
                src={
                  chainStore.getChain(
                    ibcChannelConfig.channels[
                      ibcChannelConfig.channels.length - 1
                    ].counterpartyChainId,
                  ).chainSymbolImageUrl
                }
                alt="chain icon"
              />

              <Gutter size={12} />
            </React.Fragment>
          )}

          <Text
            style={style.flatten(['subtitle2', 'color-text-high', 'flex-1'])}>
            {(() => {
              if (ibcChannelConfig.channels.length === 0) {
                return '';
              }

              const chainInfo = chainStore.getChain(
                ibcChannelConfig.channels[ibcChannelConfig.channels.length - 1]
                  .counterpartyChainId,
              );

              return chainInfo.chainName;
            })()}
          </Text>

          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </XAxis>
      </RectButton>
    </React.Fragment>
  );
});
