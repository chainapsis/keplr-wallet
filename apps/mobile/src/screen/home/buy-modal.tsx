import {registerCardModal} from '../../components/modal/card';
import {observer} from 'mobx-react-lite';
import {StackNavProp} from '../../navigation.tsx';
import {FiatOnRampServiceInfo} from '../../config.ui.ts';
import {useStyle} from '../../styles';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box} from '../../components/box';
import {IconButton} from '../../components/icon-button';
import {ArrowLeftIcon} from '../../components/icon';
import {StyleSheet, Text} from 'react-native';
import {Gutter} from '../../components/gutter';
import React, {FunctionComponent} from 'react';
import {Button} from '../../components/button';
import {RectButton} from 'react-native-gesture-handler';
import {MoonpaySvg} from '../../components/icon/fiat/moonpay.tsx';
import {KadoSvg} from '../../components/icon/fiat/kado.tsx';
import {TransakSvg} from '../../components/icon/fiat/transak.tsx';

export const BuyModal = registerCardModal(
  observer<{
    navigation: StackNavProp;
    buySupportServiceInfos: (FiatOnRampServiceInfo & {buyUrl?: string})[];
    setIsOpen: (isOpen: boolean) => void;
    setCurrentScene?: (key: string) => void;
  }>(({setCurrentScene, navigation, setIsOpen, buySupportServiceInfos}) => {
    const style = useStyle();
    const intl = useIntl();

    const safeAreaInsets = useSafeAreaInsets();

    return (
      <Box paddingX={12} paddingBottom={12 + safeAreaInsets.bottom}>
        <Box paddingY={8} alignY="center">
          {setCurrentScene ? (
            <Box position="absolute" zIndex={1}>
              <IconButton
                onPress={() => {
                  setCurrentScene('List');
                }}
                icon={color => <ArrowLeftIcon color={color} size={24} />}
                containerStyle={style.flatten(['width-32', 'height-32'])}
              />
            </Box>
          ) : null}
          <Text
            style={StyleSheet.flatten([
              style.flatten(['color-white', 'text-center', 'h4']),
            ])}>
            <FormattedMessage id="page.main.components.buy-crypto-modal.title" />
          </Text>
        </Box>

        <Gutter size={12} />
        {buySupportServiceInfos.map(serviceInfo => {
          if (serviceInfo.buyUrl === undefined) {
            return null;
          }

          return (
            <React.Fragment key={serviceInfo.serviceId}>
              <ServiceItem
                navigation={navigation}
                serviceInfo={serviceInfo}
                close={() => setIsOpen(false)}
              />
              <Gutter size={12} />
            </React.Fragment>
          );
        })}
        <Gutter size={8} />
        <Button
          size="large"
          color="secondary"
          text={intl.formatMessage({
            id: 'page.main.components.buy-crypto-modal.cancel-button',
          })}
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  }),
);

const ServiceItem: FunctionComponent<{
  navigation: StackNavProp;

  serviceInfo: FiatOnRampServiceInfo & {buyUrl?: string};
  close: () => void;
}> = ({navigation, serviceInfo, close}) => {
  const style = useStyle();

  return (
    <Box
      height={66}
      borderRadius={6}
      style={style.flatten(['overflow-hidden'])}
      alignX="center"
      alignY="center">
      <RectButton
        style={style.flatten([
          'flex-row',
          'items-center',
          'justify-center',
          'width-full',
          'height-full',
          'background-color-gray-500',
          'gap-4',
        ])}
        rippleColor={style.get('color-gray-550').color}
        underlayColor={style.get('color-gray-550').color}
        activeOpacity={0.3}
        onPress={async () => {
          if (serviceInfo.buyUrl) {
            navigation.navigate('Web', {
              url: serviceInfo.buyUrl,
              isExternal: true,
            });
          }

          close();
        }}>
        <Box>
          {(() => {
            if (serviceInfo.serviceId === 'moonpay') {
              return <MoonpaySvg />;
            }
            if (serviceInfo.serviceId === 'kado') {
              return <KadoSvg />;
            }
            if (serviceInfo.serviceId === 'transak') {
              return <TransakSvg />;
            }
          })()}
        </Box>
        <Text style={style.flatten(['color-text-high', 'subtitle1'])}>
          {serviceInfo.serviceName}
        </Text>
      </RectButton>
    </Box>
  );
};
