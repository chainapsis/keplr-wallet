import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { AppCurrency, ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

/**
 * 그냥 이미지 컴포넌트인데 오류 났을때 대체 이미지를 보여주는 기능이 있음
 * @constructor
 */
export const Image: FunctionComponent<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    defaultSrc?: string;
    alt: string;
  }
> = (props) => {
  const {
    src: propSrc,
    onError: propOnError,
    alt,
    defaultSrc,
    ...otherProps
  } = props;

  const [src, setSrc] = useState(propSrc);
  useLayoutEffect(() => {
    setSrc(propSrc);
  }, [propSrc]);

  return (
    <img
      {...otherProps}
      src={src || defaultSrc}
      alt={alt}
      onError={(e) => {
        if (defaultSrc) {
          setSrc(defaultSrc);
        }

        if (propOnError) {
          propOnError(e);
        }
      }}
    />
  );
};

export const RawImageFallback: FunctionComponent<
  React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string | undefined; // 얘는 undefined더라도 일단 넣으라고 일부로 ?를 안붙인거임.
    alt: string;

    size: string;
  }
> = (props) => {
  const { style, size, ...otherProps } = props;

  return (
    <Image
      {...otherProps}
      defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
      style={{
        borderRadius: "1000000px",
        position: "relative",
        width: size,
        height: size,
        ...style,
      }}
    />
  );
};

export const ChainImageFallback: FunctionComponent<
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
    chainInfo: ChainInfo | ModularChainInfo;

    size: string;
    alt?: string;
  }
> = (props) => {
  const { style, size, chainInfo, ...otherProps } = props;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <Image
        src={chainInfo.chainSymbolImageUrl}
        alt={chainInfo.chainName}
        {...otherProps}
        defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
        style={{
          borderRadius: "1000000px",
          width: size,
          height: size,
          ...style,
        }}
      />
    </div>
  );
};

export const CurrencyImageFallback: FunctionComponent<
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
    chainInfo: ChainInfo | ModularChainInfo;
    currency: AppCurrency;

    size: string;
    alt?: string;
  }
> = observer((props) => {
  const { chainStore } = useStore();

  const { style, size, currency, chainInfo, ...otherProps } = props;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <Image
        src={currency.coinImageUrl}
        alt={currency.coinDenom}
        {...otherProps}
        defaultSrc={require("../../public/assets/img/chain-icon-alt.png")}
        style={{
          borderRadius: "1000000px",
          width: size,
          height: size,
          ...style,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {(() => {
          let isAxelarBridged = false;
          const axelarChainIdentifier = "axelar-dojo";

          if ("paths" in currency) {
            if (
              "originChainId" in currency &&
              currency.originChainId &&
              "originCurrency" in currency &&
              currency.originCurrency
            ) {
              if (
                chainStore.hasModularChain(currency.originChainId) &&
                ChainIdHelper.parse(currency.originChainId).identifier ===
                  axelarChainIdentifier &&
                currency.originCurrency.coinMinimalDenom !== "uaxl"
              ) {
                isAxelarBridged = true;
              }
            }
          } else {
            if (
              ChainIdHelper.parse(chainInfo.chainId).identifier ===
                axelarChainIdentifier &&
              currency.coinMinimalDenom !== "uaxl"
            ) {
              isAxelarBridged = true;
            }
          }

          if (
            isAxelarBridged &&
            chainStore.hasModularChain(axelarChainIdentifier)
          ) {
            const axlCurrency = chainStore
              .getModularChainInfoImpl(axelarChainIdentifier)
              .findCurrency("uaxl");

            if (axlCurrency && axlCurrency.coinImageUrl) {
              return (
                <Image
                  alt="axelar bridged token"
                  src={axlCurrency.coinImageUrl}
                  style={{
                    borderRadius: "1000000px",
                    width: "100%",
                    height: "100%",
                    transform: "scale(0.55) translate(60%, 55%)",
                  }}
                />
              );
            }
          }
        })()}
      </div>
    </div>
  );
});
