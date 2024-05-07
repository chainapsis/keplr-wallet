import {DimensionValue, ViewStyle} from 'react-native';

export interface RadioGroupProps {
  size?: 'default' | 'large';

  selectedKey?: string;
  items: {
    key: string;
    text: string;
  }[];
  onSelect: (key: string) => void;

  itemMinWidth?: DimensionValue;

  style?: ViewStyle;
}
