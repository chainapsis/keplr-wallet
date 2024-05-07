import {registerCardModal} from '../../../../components/modal/card';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {Box} from '../../../../components/box';
import {BaseModalHeader} from '../../../../components/modal';
import {useStyle} from '../../../../styles';
import {Gutter} from '../../../../components/gutter';
import {TextInput} from '../../../../components/input';
import {Button} from '../../../../components/button';
import {useStore} from '../../../../stores';
import {useIntl} from 'react-intl';

export const AddFavoriteModal = registerCardModal(
  observer<{setIsOpen: (isOpen: boolean) => void; url: string}>(
    ({setIsOpen, url}) => {
      const intl = useIntl();
      const style = useStyle();

      const {webpageStore} = useStore();

      const [name, setName] = React.useState('');
      const [error, setError] = React.useState('');

      return (
        <Box paddingX={12} paddingBottom={12}>
          <BaseModalHeader
            title={intl.formatMessage({
              id: 'page.browser.add-favorite.modal.title',
            })}
            titleStyle={style.flatten(['h4', 'text-left'])}
            style={style.flatten(['padding-left-8'])}
          />

          <Gutter size={36} />

          <TextInput
            label={intl.formatMessage({
              id: 'page.browser.favorite.name-input.label',
            })}
            value={name}
            error={error}
            onChangeText={text => setName(text)}
          />

          <Gutter size={20} />

          <TextInput
            label={intl.formatMessage({
              id: 'page.browser.favorite.url-input.label',
            })}
            disabled={true}
            value={url}
          />

          <Gutter size={80} />

          <Button
            text={intl.formatMessage({id: 'button.save'})}
            size="large"
            color="primary"
            onPress={() => {
              if (!name) {
                setError('Name is required');
                return;
              }

              webpageStore.addFavoriteUrl({
                name,
                url,
              });
              setError('');

              setIsOpen(false);
            }}
          />
        </Box>
      );
    },
  ),
);
