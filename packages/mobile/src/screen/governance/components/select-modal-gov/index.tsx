import React, {useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {Box} from '../../../../components/box';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';
import {registerCardModal} from '../../../../components/modal/card';
import {EmptyView, EmptyViewText} from '../../../../components/empty-view';
import {useIntl} from 'react-intl';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';
import {useFocusOnModal} from '../../../../hooks/use-focus';

export interface SelectModalItem {
  key: string;
  label: string | React.ReactNode;
  imageUrl?: string;
}

export const GovSelectChainModal = registerCardModal(
  observer<{
    items: SelectModalItem[];
    placeholder?: string;
    onSelect: (item: SelectModalItem) => void;
  }>(({items, placeholder, onSelect}) => {
    const style = useStyle();
    const [search, setSearch] = useState('');
    const intl = useIntl();
    const searchRef = useFocusOnModal();

    const filtered = search
      ? items.filter(item => {
          const trimmedSearchText = search.trim();
          if (trimmedSearchText.length > 0) {
            return (
              typeof item.label === 'string' &&
              item.label.toLowerCase().includes(trimmedSearchText.toLowerCase())
            );
          }
        })
      : items;

    return (
      <React.Fragment>
        <Box paddingX={12}>
          <Gutter size={12} />
          <SearchTextInput
            ref={searchRef}
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={placeholder}
          />

          <Gutter size={12} />
        </Box>
        {
          <ScrollView isGestureScrollView={true} style={{height: 250}}>
            {filtered.map(item => {
              return (
                <RectButton
                  underlayColor={style.get('color-gray-550').color}
                  rippleColor={style.get('color-gray-550').color}
                  activeOpacity={1}
                  style={style.flatten(['background-color-gray-600'])}
                  onPress={() => {
                    onSelect(item);
                  }}
                  key={item.key}>
                  <Box
                    paddingY={14}
                    paddingLeft={16}
                    paddingRight={8}
                    borderRadius={6}
                    height={74}
                    alignY="center"
                    alignX="center">
                    <Columns sum={1} alignY="center" gutter={8}>
                      <Box>
                        <ChainImageFallback
                          style={{
                            width: 32,
                            height: 32,
                          }}
                          src={item.imageUrl}
                          alt="chain icon"
                        />
                      </Box>
                      <Text
                        style={style.flatten(['subtitle3', 'color-text-high'])}>
                        {item.label}
                      </Text>
                      <Column weight={1} />
                    </Columns>
                  </Box>
                </RectButton>
              );
            })}
            {filtered.length === 0 ? (
              <React.Fragment>
                <Gutter size={30} />
                <EmptyView>
                  <Box alignX="center" width={312}>
                    <EmptyViewText
                      text={intl.formatMessage({
                        id: 'page.governance.components.select-chain-modal.empty-title',
                      })}
                    />
                    <Gutter size={12} />
                    <EmptyViewText
                      text={intl.formatMessage({
                        id: 'page.governance.components.select-chain-modal.empty-text',
                      })}
                    />
                  </Box>
                </EmptyView>
              </React.Fragment>
            ) : null}
          </ScrollView>
        }
      </React.Fragment>
    );
  }),
);
