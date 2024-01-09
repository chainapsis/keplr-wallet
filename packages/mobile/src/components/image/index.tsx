import React, {FunctionComponent} from 'react';
import FastImage from 'react-native-fast-image';
/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image: FunctionComponent<{
  defaultSrc?: number;
  alt: string;
  src?: string;
  style?: Object;

  cache?: 'immutable' | 'web' | 'cacheOnly';
}> = props => {
  const {src: propSrc, defaultSrc, style, cache} = props;

  return (
    <FastImage
      source={
        propSrc
          ? {
              uri: propSrc,
              cache: cache || FastImage.cacheControl.web,
            }
          : defaultSrc
      }
      style={style}
      defaultSource={defaultSrc}
    />
  );
};

export const ChainImageFallback: FunctionComponent<{
  src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
  alt: string;
  style: Object;
}> = ({src, style}) => {
  return (
    <FastImage
      style={{
        ...style,
        borderRadius: 99999,
      }}
      source={
        src
          ? {uri: src, cache: FastImage.cacheControl.web}
          : require('../../public/assets/img/chain-icon-alt.png')
      }
      resizeMode={FastImage.resizeMode.contain}
    />
  );
};
