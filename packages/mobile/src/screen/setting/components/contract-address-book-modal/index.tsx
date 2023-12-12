import React, {useState} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../stores';
import {useFocusOnMount} from '../../../../hooks/use-focus-on-mount';
import {Linking, Text} from 'react-native';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {EmptyView} from '../../../../components/empty-view';
import {ContractAddressItem} from '../contract-item';
import {TokenContractListRepoURL} from '../../../../config.ui';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {registerCardModal} from '../../../../components/modal/card';

export const ContractAddressBookModal = registerCardModal(
  observer<{
    chainId: string;
    onSelect: (address: string) => void;
  }>(({chainId, onSelect}) => {
    const {queriesStore} = useStore();
    const style = useStyle();
    const contracts =
      queriesStore.get(chainId).tokenContracts.queryTokenContracts
        .tokenContracts;

    const [search, setSearch] = useState('');
    const searchRef = useFocusOnMount<TextInput>();

    const intl = useIntl();

    const filtered = search
      ? contracts.filter(
          contract =>
            contract.metadata.name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            contract.metadata.symbol
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
      : contracts;

    return (
      <Box paddingX={12} paddingBottom={20}>
        <Box>
          <Text
            style={style.flatten([
              'text-center',
              'subtitle1',
              'color-text-high',
              'padding-8',
            ])}>
            <FormattedMessage id="page.setting.token.add.contract-address-book-modal.title" />
          </Text>
          <Gutter size={12} />
          <SearchTextInput
            ref={searchRef}
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={intl.formatMessage({
              id: 'page.setting.token.add.contract-address-book-modal.search-placeholder',
            })}
          />

          <Gutter size={12} />
        </Box>
        <ScrollView style={{height: 200}}>
          {filtered.map((item, index) => {
            return (
              <ContractAddressItem
                key={index}
                name={item.metadata.name}
                address={item.contractAddress}
                imageUrl={item.imageUrl}
                afterSelect={address => {
                  onSelect(address);
                }}
              />
            );
          })}

          {filtered.length === 0 ? (
            <Box alignX="center" alignY="center">
              <Gutter size={50} />
              <EmptyView>
                <Text style={style.flatten(['subtitle3'])}>
                  <FormattedMessage id="page.setting.token.add.contract-address-book-modal.no-search-data" />
                </Text>
              </EmptyView>
            </Box>
          ) : null}
        </ScrollView>

        <Box
          alignX="center"
          alignY="bottom"
          paddingTop={16}
          onClick={() => {
            Linking.openURL(TokenContractListRepoURL);
          }}>
          <Text
            style={style.flatten([
              'subtitle3',
              'color-text-low',
              'text-center',
            ])}>
            <FormattedMessage
              id="page.setting.token.add.contract-address-book-modal.link"
              values={{
                link: (...chunks: any) => (
                  <Text
                    style={style.flatten(['text-underline', 'color-gray-50'])}>
                    {chunks}
                  </Text>
                ),
              }}
            />
          </Text>
        </Box>

        <Gutter size={12} />
      </Box>
    );
  }),
);
