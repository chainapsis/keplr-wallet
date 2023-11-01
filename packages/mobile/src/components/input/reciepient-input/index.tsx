import {
  EmptyAddressError,
  IMemoConfig,
  IRecipientConfig,
  IRecipientConfigWithICNS,
} from '@keplr-wallet/hooks';
import React, {forwardRef, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {TextInput} from '../text-input/text-input';
import {IconButton} from '../../icon-button';
import {useStyle} from '../../../styles';
import {UserIcon} from '../../icon/user';
import {useIntl} from 'react-intl';
import {Modal} from '../../modal';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {AddressBookModal} from './address-book-modal';
import {TextInput as NativeTextInput} from 'react-native';

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

export const RecipientInput = observer(
  forwardRef<NativeTextInput, RecipientInputProps>((props, ref) => {
    const {recipientConfig, memoConfig, bottom} = props;

    const intl = useIntl();
    const style = useStyle();
    const addressBookModalRef = useRef<BottomSheetModal>(null);

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
      <React.Fragment>
        <TextInput
          ref={ref}
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
                  <UserIcon
                    size={24}
                    color={style.get('color-gray-10').color}
                  />
                }
                hasRipple={true}
                rippleColor={style.get('color-gray-500').color}
                underlayColor={style.get('color-gray-500').color}
                containerStyle={style.flatten(['width-24', 'height-24'])}
                style={style.flatten(['padding-4', 'border-radius-64'])}
                onPress={() => {
                  addressBookModalRef.current?.present();
                }}
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

        {memoConfig ? (
          <Modal ref={addressBookModalRef} snapPoints={['40%', '70%']}>
            <BottomSheetScrollView>
              <AddressBookModal
                historyType={props.historyType}
                recipientConfig={recipientConfig}
                memoConfig={memoConfig}
                permitSelfKeyInfo={props.permitAddressBookSelfKeyInfo}
              />
            </BottomSheetScrollView>
          </Modal>
        ) : null}
      </React.Fragment>
    );
  }),
);
