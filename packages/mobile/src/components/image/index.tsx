import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import FastImage, {Source} from 'react-native-fast-image';
/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image: FunctionComponent<{
  defaultSrc: Source;
  alt: string;
  src?: string;
  style?: Object;
}> = props => {
  const {src: propSrc, defaultSrc, style} = props;

  const [imgUrl, setImgUrl] = useState<Source>({uri: ''});
  useLayoutEffect(() => {
    setImgUrl({uri: propSrc});
  }, [propSrc]);

  return (
    <FastImage
      source={imgUrl}
      style={style}
      onError={() => {
        if (defaultSrc) {
          setImgUrl(defaultSrc);
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
  // XXX: FastImage에서도 alt를 쓸 수 있는지 살펴보기...
  noop(alt);

  return (
    <FastImage
      style={{
        borderRadius: 1000000,
        ...style,
      }}
      source={{
        uri: src,
        cache: FastImage.cacheControl.web,
      }}
      defaultSource={require('../../public/assets/img/chain-icon-alt.png')}
    />
  );
};

const noop = (..._: any[]) => {
  // noop
};
