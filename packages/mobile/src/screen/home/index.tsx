import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {Text, TextInput as NativeTextInput} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {CoinPretty, PricePretty} from '@keplr-wallet/unit';
import {QueryError} from '@keplr-wallet/stores';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {LayeredHorizontalRadioGroup} from '../../components/radio-group';
import {YAxis} from '../../components/axis';
import {Stack} from '../../components/stack';
import {Columns} from '../../components/column';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../components/modal';
import {DepositModal} from './components/deposit-modal/deposit-modal';
import {BuyModal} from './buy-modal';
import {StackActions, useNavigation} from '@react-navigation/native';
import {SearchTextInput} from '../../components/input/search-text-input';
import {AvailableTabView} from './available';
import {ChainInfo} from '@keplr-wallet/types';
import {StakedTabView} from './staked';
import {ClaimAll} from './components/claim-all';
import {Box} from '../../components/box';

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

type TabStatus = 'available' | 'staked';

export const useIsNotReady = () => {
  const {chainStore, queriesStore} = useStore();
  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;
  return query.response == null && query.error == null;
};

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const searchRef = useRef<NativeTextInput | null>(null);
  const [search, setSearch] = useState('');

  const isNotReady = useIsNotReady();

  const {hugeQueriesStore} = useStore();

  const navigation = useNavigation();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>('available');
  const buyModalRef = useRef<BottomSheetModal>(null);
  const copyAddressModalRef = useRef<BottomSheetModal>(null);

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);

  return (
    <React.Fragment>
      <PageWithScrollView
        backgroundMode={'default'}
        style={style.flatten(['padding-x-12'])}>
        <Stack gutter={10}>
          <YAxis alignX="center">
            <LayeredHorizontalRadioGroup
              selectedKey={tabStatus}
              items={[
                {
                  key: 'available',
                  text: 'available',
                },
                {
                  key: 'staked',
                  text: 'staked',
                },
              ]}
              onSelect={key => {
                setTabStatus(key as TabStatus);
              }}
              itemMinWidth={92}
            />
          </YAxis>
          <Box height={168} alignX="center" alignY="center">
            <Text
              style={style.flatten([
                'color-text-low',
                'font-extrabold',
                'font-medium',
                'h4',
              ])}>
              Total Available
            </Text>
            <Gutter size={10} />
            <Text style={style.flatten(['color-text-high', 'mobile-h2'])}>
              {availableTotalPrice?.toString()}
            </Text>
          </Box>
          <Columns sum={1} gutter={10}>
            <Button
              text="Deposit"
              size="large"
              color="secondary"
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                copyAddressModalRef.current?.present();
              }}
            />
            <Button
              text="Buy"
              size="large"
              color="secondary"
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                buyModalRef.current?.present();
              }}
            />
            <Button
              text="Send"
              size="large"
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                navigation.dispatch({
                  ...StackActions.push('Send.SelectAsset'),
                });
              }}
            />
          </Columns>
          <Gutter size={12} />
          <ClaimAll isNotReady={isNotReady} />

          {!isNotReady ? (
            <Stack gutter={12}>
              {tabStatus === 'available' ? (
                <SearchTextInput
                  ref={searchRef}
                  value={search}
                  onChange={e => {
                    e.preventDefault();
                    setSearch(e.nativeEvent.text);
                  }}
                  placeholder="Search for asset or chain (i.e. ATOM, Cosmos)"
                />
              ) : null}
            </Stack>
          ) : null}

          {tabStatus === 'available' ? (
            <AvailableTabView
              search={search}
              isNotReady={isNotReady}
              onClickGetStarted={() => {
                copyAddressModalRef.current?.present();
              }}
            />
          ) : (
            <StakedTabView />
          )}
        </Stack>
      </PageWithScrollView>

      <Modal ref={copyAddressModalRef} snapPoints={['60%']}>
        <DepositModal />
      </Modal>
      <Modal ref={buyModalRef} snapPoints={['50%']}>
        <BuyModal />
      </Modal>
    </React.Fragment>
  );
});
