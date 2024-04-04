import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import {TextInput} from '../../../components/input';
import {SearchIcon} from '../../../components/icon';
import {useIntl} from 'react-intl';
import {useStore} from '../../../stores';
import {
  BoundaryScrollView,
  BoundaryScrollViewBoundary,
} from '../../../components/boundary-scroll-view';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TokenItem} from '../../home/components/token';
import {Gutter} from '../../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation.tsx';

export const IBCSwapDestinationSelectAssetScreen: FunctionComponent = observer(
  () => {
    const intl = useIntl();
    const style = useStyle();
    const safeAreaInsets = useSafeAreaInsets();

    const navigation = useNavigation<StackNavProp>();

    const [search, setSearch] = useState('');

    const {hugeQueriesStore} = useStore();

    const tokens = hugeQueriesStore.getAllBalances(false);

    return (
      <Box
        style={{
          flex: 1,
        }}>
        <Box paddingX={12}>
          <TextInput
            left={color => <SearchIcon size={20} color={color} />}
            value={search}
            placeholder={intl.formatMessage({
              id: 'page.send.select-asset.search-placeholder',
            })}
            onChange={e => {
              e.preventDefault();

              setSearch(e.nativeEvent.text);
            }}
          />

          <Gutter size={10} />
        </Box>

        <BoundaryScrollView
          contentContainerStyle={{
            ...style.flatten(['flex-grow-1', 'padding-x-12']),
            paddingBottom: safeAreaInsets.bottom,
          }}>
          <BoundaryScrollViewBoundary
            itemHeight={74}
            gap={8}
            items={tokens.map(token => {
              return (
                <TokenItem
                  viewToken={token}
                  onClick={() => {
                    navigation.navigate({
                      name: 'Swap',
                      params: {test: token.token.currency.coinMinimalDenom},
                      merge: true,
                    });
                  }}
                />
              );
            })}
          />
        </BoundaryScrollView>
      </Box>
    );
  },
);
