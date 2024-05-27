import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../styles';
import {Path, Svg} from 'react-native-svg';
import {Text} from 'react-native';
import {Box} from '../box';
import {FormattedMessage} from 'react-intl';

export const EmptyView: FunctionComponent<
  PropsWithChildren<{subject?: string; altSvg?: React.ReactElement}>
> = ({subject, altSvg, children}) => {
  const style = useStyle();

  return (
    <Box alignY="center" alignX="center" style={style.flatten(['gap-12'])}>
      {altSvg ? (
        altSvg
      ) : (
        <Svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <Path
            d="M45 40.5H27M39.182 18.932L32.818 12.568C31.9741 11.7241 30.8295 11.25 29.636 11.25H13.5C9.77208 11.25 6.75 14.2721 6.75 18V54C6.75 57.7279 9.77208 60.75 13.5 60.75H58.5C62.2279 60.75 65.25 57.7279 65.25 54V27C65.25 23.2721 62.2279 20.25 58.5 20.25H42.364C41.1705 20.25 40.0259 19.7759 39.182 18.932Z"
            stroke={style.get('color-gray-400').color}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {subject ? (
        <Text style={style.flatten(['color-gray-400', 'subtitle3'])}>
          <FormattedMessage
            id="components.empty-view.text"
            values={{subject}}
          />
        </Text>
      ) : (
        children
      )}
    </Box>
  );
};

export const EmptyViewText = ({text}: {text: string}) => {
  const style = useStyle();

  return (
    <Text style={style.flatten(['color-gray-400', 'subtitle3', 'text-center'])}>
      {text}
    </Text>
  );
};
