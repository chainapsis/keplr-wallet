import styled from "styled-components";
import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { ColorPalette } from "../../../../styles";
import { Button2 } from "../../../../components/typography";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainImageFallback } from "../../../../components/image";
import { Bleed } from "../../../../components/bleed";
import { Gutter } from "../../../../components/gutter";
import { ChainInfo } from "@keplr-wallet/types";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    background-color: ${ColorPalette["gray-600"]};
    border: 1px solid rgba(44, 75, 226, 0.5);
    border-radius: 0.375rem;
  `,
  TextButton: styled(Button2)`
    flex: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    height: 2.5rem;
    margin: 0.25rem;

    border-radius: 0.375rem;

    cursor: pointer;
    user-select: none;

    white-space: nowrap;

    :hover {
      background-color: ${ColorPalette["gray-500"]};
    }
  `,
  Divider: styled.div`
    height: 1.375rem;

    border: 1px solid rgba(255, 255, 255, 0.3);
  `,
};

export const InternalLinkView: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const [imgs, setImgs] = useState<ChainInfo[]>([]);

  useLayoutEffect(() => {
    const chainInfos = chainStore.chainInfos
      .filter((chainInfo) => chainInfo.embedded.embedded)
      .filter(
        (chainInfo) =>
          chainInfo.chainSymbolImageUrl != null &&
          chainInfo.chainSymbolImageUrl.length > 0
      )
      .map((chainInfo) => chainInfo.embedded);

    setImgs(shuffle(chainInfos.slice()));

    // Should be called once. This is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Styles.Container>
      <Styles.TextButton
        onClick={(e) => {
          e.preventDefault();

          if (keyRingStore.selectedKeyInfo) {
            browser.tabs
              .create({
                url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}`,
              })
              .then(() => {
                window.close();
              });
          }
        }}
      >
        <Gutter size="0.5rem" />
        {imgs.slice(0, 3).map((chainInfo, i) => {
          return (
            <Bleed key={chainInfo.chainId} left={i === 0 ? "0" : "0.5rem"}>
              <ChainImageFallback
                src={chainInfo.chainSymbolImageUrl}
                alt={chainInfo.chainName}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
            </Bleed>
          );
        })}
        <Gutter size="0.15rem" />
        Manage Chains
        <Gutter size="0.15rem" />
        <ManageChainListIcon size="1.125rem" />
        <Gutter size="0.5rem" />
      </Styles.TextButton>

      <Styles.Divider />

      <Styles.TextButton
        onClick={() =>
          browser.tabs.create({ url: "https://wallet.keplr.app/?tab=staking" })
        }
      >
        Go to Dashboard
      </Styles.TextButton>
    </Styles.Container>
  );
});

function shuffle(array: ChainInfo[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const ManageChainListIcon: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
      />
    </svg>
  );
};
