import React from 'react';
import {Text} from 'react-native';
import {BottomSheetView} from '@gorhom/bottom-sheet';
import {Box} from '../../components/box';
import {useStyle} from '../../styles';
import {Columns} from '../../components/column';
import {InformationOutlinedIcon} from '../../components/icon/information-outlined';

export const InformationModal = () => {
  const style = useStyle();
  return (
    <BottomSheetView
      style={style.flatten(['padding-x-12', 'padding-bottom-20'])}>
      <Box>
        <Box paddingBottom={20} paddingTop={12} paddingX={8}>
          <Columns sum={1}>
            <InformationOutlinedIcon
              size={20}
              color={style.get('color-text-low').color}
            />
            <Text style={style.flatten(['h4', 'color-text-high'])}>
              Available Balance
            </Text>
          </Columns>
        </Box>
        <Text
          style={style.flatten([
            'body2',
            'color-text-middle',
            'height-90',
            'padding-x-16',
          ])}>
          The amount of your assets that are available for use or transfer
          immediately, except for those that are currently staked or locked in
          LP pools.
        </Text>
      </Box>
    </BottomSheetView>
  );
};
