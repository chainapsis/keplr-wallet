import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const InformationOutlinedIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 21" fill="none">
      <Path
        d="M9.1665 6.67594H10.8332V8.34261H9.1665V6.67594ZM9.1665 10.0093H10.8332V15.0093H9.1665V10.0093ZM9.99984 2.50928C5.39984 2.50928 1.6665 6.24261 1.6665 10.8426C1.6665 15.4426 5.39984 19.1759 9.99984 19.1759C14.5998 19.1759 18.3332 15.4426 18.3332 10.8426C18.3332 6.24261 14.5998 2.50928 9.99984 2.50928ZM9.99984 17.5093C6.32484 17.5093 3.33317 14.5176 3.33317 10.8426C3.33317 7.16761 6.32484 4.17594 9.99984 4.17594C13.6748 4.17594 16.6665 7.16761 16.6665 10.8426C16.6665 14.5176 13.6748 17.5093 9.99984 17.5093Z"
        fill={color}
      />
    </Svg>
  );
};
