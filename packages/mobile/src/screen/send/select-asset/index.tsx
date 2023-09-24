import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useState} from 'react';
import {useStyle} from '../../../styles';
import {useStore} from '../../../stores';
import {Dec} from '@keplr-wallet/unit';
import {PageWithScrollView} from '../../../components/page';
import {TokenItem} from '../../../components/token-view';
import {Stack} from '../../../components/stack';
import {SearchIcon} from '../../../components/icon';
import {TextInput} from '../../../components/input';
import {Gutter} from '../../../components/gutter';
import {Column, Columns} from '../../../components/column';
import {Pressable, Text} from 'react-native';
import {Checkbox} from '../../../components/checkbox';

export const SendScreen: FunctionComponent = observer(() => {
  const style = useStyle();

  const {hugeQueriesStore} = useStore();

  const [search, setSearch] = useState('');
  const [hideIBCToken, setHideIBCToken] = useState(false);

  const tokens = hugeQueriesStore.getAllBalances(!hideIBCToken);

  const filteredTokens = useMemo(() => {
    const zeroDec = new Dec(0);
    const newTokens = tokens.filter(token => {
      return token.token.toDec().gt(zeroDec);
    });

    const trimSearch = search.trim();

    if (!trimSearch) {
      return newTokens;
    }

    const filtered = newTokens.filter(token => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });

    return filtered;
  }, [search, tokens]);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['margin-12'])}>
      <Gutter size={10} />

      <TextInput
        left={color => <SearchIcon size={20} color={color} />}
        placeholder="Search by a chain or asset name"
        onChange={e => {
          e.preventDefault();

          setSearch(e.nativeEvent.text);
        }}
      />

      <Gutter size={10} />

      <Pressable onPress={() => setHideIBCToken(!hideIBCToken)}>
        <Columns sum={1} gutter={4}>
          <Column weight={1} />

          <Text
            style={style.flatten([
              hideIBCToken ? 'color-gray-200' : 'color-gray-300',
              'body2',
            ])}>
            Hide IBC token
          </Text>

          <Checkbox
            size="small"
            checked={hideIBCToken}
            onPress={() => setHideIBCToken(!hideIBCToken)}
          />
        </Columns>
      </Pressable>

      <Gutter size={12} />

      <Stack gutter={8}>
        {filteredTokens.map(viewToken => {
          return (
            <TokenItem
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
              viewToken={viewToken}
            />
          );
        })}
      </Stack>
    </PageWithScrollView>
  );
});
