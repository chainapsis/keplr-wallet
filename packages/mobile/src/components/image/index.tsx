import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {ImageSourcePropType, Image as NativeImage} from 'react-native';

/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image: FunctionComponent<{
  defaultSrc: ImageSourcePropType;
  alt: string;
  src?: string;
  style?: Object;
}> = props => {
  const {src: propSrc, alt, defaultSrc, style} = props;

  const [source, setSource] = useState<ImageSourcePropType>({uri: propSrc});
  useLayoutEffect(() => {
    setSource({uri: propSrc});
  }, [propSrc]);

  return (
    <NativeImage
      source={source || defaultSrc}
      style={style}
      alt={alt}
      onError={_ => {
        if (defaultSrc) {
          setSource(defaultSrc);
        }
      }}
    />
  );
};

export const ChainImageFallback: FunctionComponent<{
  src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
  alt: string;
  style: Object;
}> = ({src, alt, style}) => {
  return (
    <Image
      defaultSrc={require('../../public/assets/img/chain-icon-alt.png')}
      style={{
        borderRadius: 1000000,
        ...style,
      }}
      src={src}
      alt={alt}
    />
  );
};
