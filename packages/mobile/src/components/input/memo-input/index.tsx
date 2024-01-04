import React, {FunctionComponent} from 'react';
import {IMemoConfig} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {useIntl} from 'react-intl';
import {TextInput} from '../text-input/text-input';

export const MemoInput: FunctionComponent<{
  memoConfig: IMemoConfig;
  label?: string;
  placeholder?: string;
}> = observer(({memoConfig, label, placeholder}) => {
  const intl = useIntl();

  return (
    <TextInput
      autoCapitalize="none"
      label={
        label ??
        intl.formatMessage({id: 'components.input.memo-input.memo-label'})
      }
      placeholder={placeholder}
      onChangeText={text => {
        memoConfig.setValue(text);
      }}
      value={memoConfig.value}
      error={(() => {
        const uiProperties = memoConfig.uiProperties;

        const err = uiProperties.error || uiProperties.warning;
        if (err) {
          return err.message || err.toString();
        }
      })()}
    />
  );
});
