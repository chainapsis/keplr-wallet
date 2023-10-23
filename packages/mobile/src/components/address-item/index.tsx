import React, {FunctionComponent} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Pressable, Text} from 'react-native';
import {Columns} from '../column';
import {XAxis, YAxis} from '../axis';
import {Gutter} from '../gutter';
import {UserIcon} from '../icon/user';
import {Bech32Address} from '@keplr-wallet/cosmos';

export const AddressItem: FunctionComponent<{
  timestamp?: number;
  name?: string;
  address: string;
  memo?: string;
  isShowMemo?: boolean;
  onClick?: () => void;

  // true면 border를 추가함.
  highlight?: boolean;
}> = ({
  timestamp,
  name,
  address,
  memo,
  isShowMemo,
  onClick,

  highlight,
}) => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <Pressable onPress={onClick}>
      <Box
        paddingX={16}
        paddingY={20}
        backgroundColor={style.get('color-gray-600').color}
        borderRadius={6}
        borderWidth={highlight ? 1 : undefined}
        borderColor={highlight ? style.get('color-gray-400').color : undefined}>
        <Columns sum={1} alignY="center">
          <YAxis>
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
          </YAxis>
        </Columns>
      </Box>
    </Pressable>
  );
};
