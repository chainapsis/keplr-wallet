import {DimensionValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import {SharedValue} from 'react-native-reanimated';

export interface VerticalCollapseTransitionProps {
  collapsed: boolean;
  width?: DimensionValue | SharedValue<DimensionValue>;
  transitionAlign?: 'top' | 'bottom' | 'center';
}
