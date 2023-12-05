import React from 'react';
import {Text} from 'react-native';
import {Box} from '../../components/box';
import {useStyle} from '../../styles';
import {Columns} from '../../components/column';
import {InformationOutlinedIcon} from '../../components/icon/information-outlined';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {registerCardModal} from './card';
export interface InformationModalProps {
  title: string;
  paragraph: string;
}
export const InformationModal = registerCardModal(
  ({title, paragraph}: InformationModalProps) => {
    const style = useStyle();
    const insects = useSafeAreaInsets();
    return (
      <Box paddingX={12} paddingBottom={60 + insects.bottom}>
        <Box>
          <Box paddingBottom={12} paddingX={8}>
            <Columns sum={1} gutter={10} alignY="center">
              <InformationOutlinedIcon
                size={20}
                color={style.get('color-text-low').color}
              />

              <Text
                style={style.flatten(['h4', 'color-text-high', 'padding-8'])}>
                {title}
              </Text>
            </Columns>
          </Box>
          <Text
            style={style.flatten([
              'body2',
              'color-text-middle',
              'padding-x-16',
            ])}>
            {paragraph}
          </Text>
        </Box>
      </Box>
    );
  },
);
