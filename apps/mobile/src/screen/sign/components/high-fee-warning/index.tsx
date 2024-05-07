import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';
import {FormattedMessage} from 'react-intl';
import {XAxis} from '../../../../components/axis';
import {Checkbox} from '../../../../components/checkbox';
import {Box} from '../../../../components/box';
import {Gutter} from '../../../../components/gutter';

export const HighFeeWarning: FunctionComponent<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = observer(({checked, onChange}) => {
  const style = useStyle();

  return (
    <RectButton
      style={style.flatten([
        'padding-18',
        'border-radius-8',
        'background-color-gray-500',
        'border-width-1',
        checked ? 'border-color-gray-500' : 'border-color-blue-400',
      ])}
      rippleColor={style.get('color-gray-550').color}
      underlayColor={style.get('color-gray-550').color}
      onPress={() => onChange(!checked)}>
      <XAxis alignY="center">
        <Text style={style.flatten(['body3', 'color-text-high'])}>
          <FormattedMessage
            id="page.sign.cosmos.tx.high-fee-warning"
            values={{br: '\n'}}
          />
        </Text>

        <Box style={{flex: 1}} />

        <Gutter size={6} />

        <Checkbox checked={checked} onPress={onChange} />
      </XAxis>
    </RectButton>
  );
});
