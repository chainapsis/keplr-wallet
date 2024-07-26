import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {QRCodeIcon} from '../../../components/icon';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const QRCodeChip: FunctionComponent<{
  onClick: () => void;
}> = ({onClick}) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={onClick}
      style={style.flatten(['margin-right-20'])}>
      <QRCodeIcon size={24} color={style.get('color-gray-200').color} />
    </TouchableWithoutFeedback>
  );
};
