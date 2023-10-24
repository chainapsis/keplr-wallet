import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
// import {useFocusOnMount} from '../../hooks/use-focus-on-mount';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../stores';
import {useFocusOnMount} from '../../../../hooks/use-focus-on-mount';
import {Linking, Text, TextInput} from 'react-native';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {useStyle} from '../../../../styles';
import {Modal} from '../../../../components/modal';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {Box} from '../../../../components/box';
import {EmptyView} from '../../../../components/empty-view';
import {ContractAddressItem} from '../contract-item';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TokenContractListRepoURL} from '../../../../utils/config.ui';

export const ContractAddressBookModal: FunctionComponent<{
  modalRef: React.RefObject<BottomSheetModalMethods>;
  chainId: string;
  onSelect: (address: string) => void;
}> = observer(({modalRef, chainId, onSelect}) => {
  const {queriesStore} = useStore();
  const style = useStyle();
  const contracts =
    queriesStore.get(chainId).tokenContracts.queryTokenContracts.tokenContracts;
  const insect = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const searchRef = useFocusOnMount<TextInput>();
  const intl = useIntl();

  const filtered = search
    ? contracts.filter(
        contract =>
          contract.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
          contract.metadata.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    : contracts;

  return (
    <Modal ref={modalRef} snapPoints={['80%']}>
      <Box paddingTop={0} paddingRight={12} paddingBottom={0} paddingLeft={12}>
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
      <BottomSheetFlatList
        data={filtered}
        renderItem={({item, index}) => {
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
        }}
        ListEmptyComponent={
          <React.Fragment>
            <Gutter size={120} direction="vertical" />
            <EmptyView>
              <Text style={style.flatten(['subtitle3'])}>
                <FormattedMessage id="page.setting.token.add.contract-address-book-modal.no-search-data" />
              </Text>
            </EmptyView>
          </React.Fragment>
        }
      />

      {/* <BottomSheetView> */}

      {/* </BottomSheetView> */}

      {/* <SimpleBar
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            height: '21.5rem',
          }}>
          {contracts.length === 0 ? (
            <React.Fragment>
              <Gutter size={120} direction="vertical" />
              <EmptyView>
                <Text style={style.flatten(['subtitle3'])}>
                  <FormattedMessage id="page.setting.token.add.contract-address-book-modal.no-search-data" />
                </Text>
              </EmptyView>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {filtered.map((contract, index) => (
                <ContractAddressItem
                  key={index}
                  name={contract.metadata.name}
                  address={contract.contractAddress}
                  imageUrl={contract.imageUrl}
                  afterSelect={address => {
                    onSelect(address);
                  }}
                />
              ))}
            </React.Fragment>
          )}
        </SimpleBar> */}

      <Box
        alignX="center"
        alignY="bottom"
        paddingTop={16}
        paddingBottom={insect.bottom}
        onClick={() => {
          Linking.openURL(TokenContractListRepoURL);
        }}>
        <Text
          style={style.flatten(['subtitle3', 'color-text-low', 'text-center'])}>
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
    </Modal>
  );
});
