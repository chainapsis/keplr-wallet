import {
  EmptyAddressError,
  IMemoConfig,
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from '@keplr-wallet/hooks';
import React from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../box';
import {TextInput} from '../text-input/text-input';
import {IconButton} from '../../icon-button';
import {useStyle} from '../../../styles';
import {UserIcon} from '../../icon/user';
import {useIntl} from 'react-intl';

export interface RecipientInputWithAddressBookProps {
  historyType: string;
  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  memoConfig: IMemoConfig;

  permitAddressBookSelfKeyInfo?: boolean;
}

export interface RecipientInputWithoutAddressBookProps {
  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  memoConfig?: undefined;

  hideAddressBookButton: true;
}

export type RecipientInputProps = (
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps
) & {
  bottom?: React.ReactNode;
};

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const RecipientInput = observer<RecipientInputProps>(props => {
  const {recipientConfig, memoConfig, bottom} = props;

  const intl = useIntl();
  const style = useStyle();

  const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
    React.useState(false);

  const isICNSName: boolean = (() => {
    if ('isICNSName' in recipientConfig) {
      return recipientConfig.isICNSName;
    }
    return false;
  })();

  const isICNSFetching: boolean = (() => {
    if ('isICNSFetching' in recipientConfig) {
      return recipientConfig.isICNSFetching;
    }
    return false;
  })();

  return (
    <Box>
      <TextInput
        label={intl.formatMessage({
          id: 'components.input.recipient-input.wallet-address-label',
        })}
        value={recipientConfig.value}
        autoComplete="off"
        onChangeText={value => {
          if (
            // If icns is possible and users enters ".", complete bech32 prefix automatically.
            'isICNSEnabled' in recipientConfig &&
            recipientConfig.isICNSEnabled &&
            value.length > 0 &&
            value[value.length - 1] === '.' &&
            numOfCharacter(value, '.') === 1 &&
            numOfCharacter(recipientConfig.value, '.') === 0
          ) {
            value = value + recipientConfig.icnsExpectedBech32Prefix;
          }

          recipientConfig.setValue(value);
        }}
        right={
          memoConfig ? (
            <IconButton
              icon={
                <UserIcon size={24} color={style.get('color-gray-10').color} />
              }
              hasRipple={true}
              style={style.flatten(['border-radius-64'])}
            />
          ) : null
        }
        isLoading={isICNSFetching}
        paragraph={(() => {
          if (isICNSName && !recipientConfig.uiProperties.error) {
            return recipientConfig.recipient;
          }
        })()}
        bottom={bottom}
        error={(() => {
          const uiProperties = recipientConfig.uiProperties;

          const err = uiProperties.error || uiProperties.warning;

          if (err instanceof EmptyAddressError) {
            return;
          }

          if (err) {
            return err.message || err.toString();
          }
        })()}
      />
    </Box>
  );
});
