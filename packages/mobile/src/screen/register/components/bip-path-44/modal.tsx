import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {BottomSheetView, useBottomSheetModal} from '@gorhom/bottom-sheet';
import {BaseModalHeader} from '../../../../components/modal';
import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {TextInput} from '../../../../components/input';
import {Columns} from '../../../../components/column';
import {Button} from '../../../../components/button';
import {BIP44PathState} from './state';

export const Bip44PathModal: FunctionComponent<{
  coinType?: number;
  state: BIP44PathState;
}> = observer(({coinType, state}) => {
  const intl = useIntl();
  const style = useStyle();
  const {dismiss} = useBottomSheetModal();

  return (
    <BottomSheetView style={style.flatten(['padding-20'])}>
      <BaseModalHeader
        titleStyle={style.flatten(['h4', 'text-left'])}
        title={intl.formatMessage({
          id: 'pages.register.components.bip-44-path.title',
        })}
      />

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
            state.setAddressIndexText(text);
          }}
          errorBorder={!state.isAddressIndexValid()}
        />
      </Columns>

      <Gutter size={16} />

      <Button
        text={intl.formatMessage({id: 'button.approve'})}
        size="large"
        disabled={
          !state.isAccountValid() ||
          !state.isChangeValid() ||
          !state.isAddressIndexValid()
        }
        onPress={() => {
          dismiss();
        }}
      />
    </BottomSheetView>
  );
});
