import React, {FunctionComponent} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {Column, Columns} from '../../../../components/column';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {UserIcon} from '../../../../components/icon/user';
import {EllipsisIcon} from '../../../../components/icon/ellipsis';
import {IconButton} from '../../../../components/icon-button';

export const AddressItem: FunctionComponent<{
  timestamp?: number;
  name?: string;
  address: string;
  memo?: string;
  isShowMemo?: boolean;
  onClick?: () => void;
  onPressMenuButton?: () => void;
  // true면 border를 추가함.
  highlight?: boolean;
}> = ({
  timestamp,
  name,
  address,
  memo,
  isShowMemo,
  onClick,
  onPressMenuButton,
  highlight,
}) => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <Box
      paddingX={16}
      paddingY={20}
      backgroundColor={style.get('color-card-default').color}
      borderRadius={6}
      borderWidth={highlight ? 1 : undefined}
      borderColor={highlight ? style.get('color-gray-400').color : undefined}
      onClick={onClick}>
      <Columns sum={1} alignY="center">
        <Box maxWidth={'90%'}>
          {timestamp ? (
            <React.Fragment>
              <Text style={style.flatten(['h5', 'color-white'])}>
                <FormattedMessage
                  id="components.address-item.sent-on-date"
                  values={{
                    date: intl.formatDate(new Date(timestamp), {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    }),
                  }}
                />
              </Text>

              <Gutter size={8} />
            </React.Fragment>
          ) : null}

          {name ? (
            <React.Fragment>
              <Text style={style.flatten(['h5', 'color-white'])}>{name}</Text>

              <Gutter size={8} />
            </React.Fragment>
          ) : null}

          <XAxis alignY="center">
            <UserIcon size={12} color={style.get('color-white').color} />
            <Gutter size={4} />
            <Text style={style.flatten(['body2', 'color-gray-200'])}>
              {Bech32Address.shortenAddress(address, 30)}
            </Text>
          </XAxis>

          {isShowMemo ? (
            <XAxis alignY="center">
              {memo ? (
                <Text style={style.flatten(['body2', 'color-gray-200'])}>
                  {memo}
                </Text>
              ) : (
                <Text style={style.flatten(['body2', 'color-gray-300'])}>
                  <FormattedMessage id="components.address-item.empty-memo" />
                </Text>
              )}
            </XAxis>
          ) : null}
        </Box>
        {onPressMenuButton ? (
          <React.Fragment>
            <Column weight={1} />
            <IconButton
              icon={
                <EllipsisIcon
                  size={24}
                  color={style.get('color-gray-10').color}
                />
              }
              onPress={() => onPressMenuButton()}
            />
          </React.Fragment>
        ) : null}
      </Columns>
    </Box>
  );
};
