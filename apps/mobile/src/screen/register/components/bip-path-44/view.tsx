import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {TextInput} from '../../../../components/input';
import {Columns} from '../../../../components/column';
import {BIP44PathState} from './state';
import {Box} from '../../../../components/box';
import {CloseIcon} from '../../../../components/icon';
import {IconButton} from '../../../../components/icon-button';
import {useConfirm} from '../../../../hooks/confirm';

export const Bip44PathView: FunctionComponent<{
  coinType?: number;
  state: BIP44PathState;
  // ledger에서는 100까지밖에 허용안됨
  isLedger?: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = observer(({coinType, state, isLedger, setIsOpen}) => {
  const intl = useIntl();
  const confirm = useConfirm();
  const style = useStyle();

  const onClickReset = async () => {
    if (
      await confirm.confirm(
        '',
        intl.formatMessage({
          id: 'pages.register.components.bip-44-path.confirm-paragraph',
        }),
      )
    ) {
      state.reset();
      setIsOpen(false);
    }
  };

  return (
    <Box
      padding={16}
      paddingTop={24}
      borderRadius={8}
      backgroundColor={style.get('color-background-secondary').color}>
      <XAxis alignY="center">
        <Text
          style={style.flatten([
            'h4',
            'color-text-high',
            'flex-1',
            'padding-left-16',
          ])}>
          <FormattedMessage id="pages.register.components.bip-44-path.title" />
        </Text>

        <IconButton
          icon={
            <CloseIcon size={24} color={style.get('color-gray-300').color} />
          }
          onPress={onClickReset}
        />
      </XAxis>

      <Gutter size={16} />

      <XAxis>
        <Text
          style={style.flatten(['body1', 'color-text-low', 'margin-right-4'])}>
          •
        </Text>
        <Text style={style.flatten(['body1', 'color-text-low'])}>
          <FormattedMessage id="pages.register.components.bip-44-path.paragraph-from-one-recovery-path" />
        </Text>
      </XAxis>

      <XAxis>
        <Text
          style={style.flatten(['body1', 'color-text-low', 'margin-right-4'])}>
          •
        </Text>
        <Text style={style.flatten(['body1', 'color-text-low'])}>
          <FormattedMessage id="pages.register.components.bip-44-path.paragraph-lost" />
        </Text>
      </XAxis>

      <XAxis>
        <Text
          style={style.flatten(['body1', 'color-text-low', 'margin-right-4'])}>
          •
        </Text>
        <Text style={style.flatten(['body1', 'color-text-low'])}>
          <FormattedMessage
            id="pages.register.components.bip-44-path.paragraph-unfamiliar"
            values={{
              reset: (...chunks: any) => (
                <Text
                  style={style.flatten([
                    'body1',
                    'color-label-default',
                    'text-underline',
                  ])}
                  onPress={onClickReset}>
                  {chunks}
                </Text>
              ),
            }}
          />
        </Text>
      </XAxis>

      <Gutter size={16} />

      <Text style={style.flatten(['subtitle3', 'color-label-default'])}>
        <FormattedMessage id="pages.register.components.bip-44-path.hd-path-subtitle" />
      </Text>

      <Gutter size={6} />

      <Columns sum={1} gutter={5} alignY="center">
        <Text style={style.flatten(['body2', 'color-gray-200'])}>{`m/44'/${
          coinType != null ? coinType : '...'
        }`}</Text>

        <TextInput
          containerStyle={{flex: 1}}
          keyboardType="number-pad"
          value={state.accountText}
          onChangeText={text => {
            const accountNumber = Number.parseInt(text);
            if (isLedger ? accountNumber > 100 : accountNumber > 2147483647) {
              return;
            }
            state.setAccountText(text);
          }}
          errorBorder={!state.isAccountValid()}
        />

        <Text style={style.flatten(['body2', 'color-gray-200'])}>{"'/"}</Text>

        <TextInput
          containerStyle={{flex: 1}}
          keyboardType="number-pad"
          value={state.changeText}
          onChangeText={text => {
            state.setChangeText(text);
          }}
          errorBorder={!state.isChangeValid()}
        />

        <Text style={style.flatten(['body2', 'color-gray-200'])}>/</Text>

        <TextInput
          containerStyle={{flex: 1}}
          keyboardType="number-pad"
          value={state.addressIndexText}
          onChangeText={text => {
            const addressIndexNumber = Number.parseInt(text);
            if (
              isLedger
                ? addressIndexNumber > 100
                : addressIndexNumber > 4294967295
            ) {
              return;
            }
            state.setAddressIndexText(text);
          }}
          errorBorder={!state.isAddressIndexValid()}
        />
      </Columns>
    </Box>
  );
});
