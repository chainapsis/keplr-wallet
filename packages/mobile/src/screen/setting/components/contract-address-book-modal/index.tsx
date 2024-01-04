import React, {useState} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../stores';
import {useFocusOnModal} from '../../../../hooks/use-focus';
import {Linking, Text} from 'react-native';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {EmptyView} from '../../../../components/empty-view';
import {ContractAddressItem} from '../contract-item';
import {TokenContractListRepoURL} from '../../../../config.ui';
import {
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {registerCardModal} from '../../../../components/modal/card';
import {BaseModalHeader} from '../../../../components/modal';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';

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
    const searchRef = useFocusOnModal<TextInput>();

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
          <BaseModalHeader
            title={intl.formatMessage({
              id: 'page.setting.token.add.contract-address-book-modal.title',
            })}
          />
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
        <ScrollView isGestureScrollView={true} style={{height: 200}}>
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

        <Box alignX="center">
          <TouchableWithoutFeedback
            onPress={() => {
              Linking.openURL(TokenContractListRepoURL);
            }}>
            <Box paddingY={16} paddingX={8}>
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
                        style={style.flatten([
                          'text-underline',
                          'color-gray-50',
                        ])}>
                        {chunks}
                      </Text>
                    ),
                  }}
                />
              </Text>
            </Box>
          </TouchableWithoutFeedback>
        </Box>
      </Box>
    );
  }),
);
