import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Body3 } from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { XAxis } from "../../../../components/axis";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Lottie from "lottie-web";
import { Gutter } from "../../../../components/gutter";
import { useTheme } from "styled-components";

export const AddressChip: FunctionComponent<{
  chainId: string;

  // modal 안에서는 색상 문제로 안보여서
  // modal 안에서는 배경색을 바꿈
  inModal?: boolean;
}> = observer(({ chainId, inModal }) => {
  const { accountStore, chainStore } = useStore();

  const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);

  const theme = useTheme();

  const account = accountStore.getAccount(chainId);

  const [isHover, setIsHover] = useState(false);
  const [animCheck, setAnimCheck] = useState(false);

  useEffect(() => {
    if (animCheck) {
      const timeout = setTimeout(() => {
        setAnimCheck(false);
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [animCheck]);

  return (
    <Box
      cursor="pointer"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={(() => {
        if (isHover) {
          if (inModal) {
            return theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-450"];
          }
          return theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-550"];
        }
        if (inModal) {
          return theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-500"];
        }
        return theme.mode === "light"
          ? ColorPalette["white"]
          : ColorPalette["gray-600"];
      })()}
      borderRadius="99999px"
      borderWidth={theme.mode === "light" ? "1px" : "0"}
      borderColor={theme.mode === "light" ? ColorPalette["gray-50"] : undefined}
      paddingX="0.625rem"
      onClick={(e) => {
        e.preventDefault();

        // copy address
        navigator.clipboard.writeText(
          isEVMOnlyChain ? account.ethereumHexAddress : account.bech32Address
        );
        setAnimCheck(true);
      }}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <Body3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
        >
          {isEVMOnlyChain
            ? `${account.ethereumHexAddress.slice(
                0,
                10
              )}...${account.ethereumHexAddress.slice(32)}`
            : Bech32Address.shortenAddress(account.bech32Address, 16)}
        </Body3>
        <Gutter size="0.4rem" />
        {!animCheck ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-300"]
              }
              strokeLinecap="round"
              strokeWidth="1.6"
              d="M10.667 2.668h-6.4a1.6 1.6 0 00-1.6 1.6v6.4"
            />
            <rect
              width="7.733"
              height="7.733"
              x="5.467"
              y="5.468"
              stroke="#72747B"
              strokeWidth="1.6"
              rx="0.8"
            />
          </svg>
        ) : (
          <CheckAnim />
        )}
      </XAxis>
    </Box>
  );
});

export const QRCodeChip: FunctionComponent<{
  onClick: () => void;
}> = ({ onClick }) => {
  const theme = useTheme();

  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      cursor="pointer"
      width="1.5rem"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={
        !isHover
          ? theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
          : theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-550"]
      }
      borderRadius="99999px"
      borderWidth={theme.mode === "light" ? "1px" : "0"}
      borderColor={theme.mode === "light" ? ColorPalette["gray-50"] : undefined}
      onClick={onClick}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            fill={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
            fillRule="evenodd"
            d="M2.833 1.668c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V2.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V2.835zm.167 4.833c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V8.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V8.835zm5-6c0-.645.523-1.167 1.167-1.167h2.333c.645 0 1.167.522 1.167 1.167v2.333c0 .644-.522 1.167-1.167 1.167H8.833a1.167 1.167 0 01-1.167-1.167V2.835zm1.167-.167a.167.167 0 00-.167.167v2.333c0 .092.075.167.167.167h2.333a.167.167 0 00.167-.167V2.835a.167.167 0 00-.167-.167H8.833zm-4.84.667A.667.667 0 003.327 4v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 3.335h-.007zm6 0A.667.667 0 009.327 4v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 3.335h-.007zm-6 6a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 9.335h-.007zm6 0a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 9.335h-.007zm-2.333-1c0-.369.298-.667.667-.667h.006c.369 0 .667.298.667.667v.006a.667.667 0 01-.667.667h-.006a.667.667 0 01-.667-.667v-.006zm4-.667a.667.667 0 00-.667.667v.006c0 .368.299.667.667.667h.007a.667.667 0 00.666-.667v-.006a.667.667 0 00-.666-.667h-.007zm-.667 4c0-.368.299-.667.667-.667h.007c.368 0 .666.299.666.667v.007a.667.667 0 01-.666.666h-.007a.667.667 0 01-.667-.666v-.007zm-2.666-.667a.667.667 0 00-.667.667v.007c0 .368.298.666.667.666h.006A.667.667 0 009 11.675v-.007a.667.667 0 00-.667-.667h-.006z"
            clipRule="evenodd"
          />
        </svg>
      </XAxis>
    </Box>
  );
};

const CheckAnim: FunctionComponent = () => {
  const theme = useTheme();

  const checkAnimDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (checkAnimDivRef.current) {
      const anim = Lottie.loadAnimation({
        container: checkAnimDivRef.current,
        renderer: "svg",
        autoplay: true,
        loop: false,
        animationData:
          theme.mode === "light"
            ? {
                v: "5.7.11",
                fr: 30,
                ip: 0,
                op: 60,
                w: 1080,
                h: 1080,
                nm: "Comp 1",
                ddd: 0,
                assets: [],
                layers: [
                  {
                    ddd: 0,
                    ind: 1,
                    ty: 4,
                    nm: "Shape Layer 2",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: { a: 0, k: 0, ix: 10 },
                      p: { a: 0, k: [540, 540, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
                      s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            d: 1,
                            ty: "el",
                            s: { a: 0, k: [240, 240], ix: 2 },
                            p: { a: 0, k: [0, 0], ix: 3 },
                            nm: "Ellipse Path 1",
                            mn: "ADBE Vector Shape - Ellipse",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.176, 0.851, 0.561], ix: 4 },
                            o: { a: 0, k: 0, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [67, 55], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Ellipse 1",
                        np: 3,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                  {
                    ddd: 0,
                    ind: 2,
                    ty: 4,
                    nm: "Layer 1 Outlines",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: {
                        a: 1,
                        k: [
                          {
                            i: { x: [0.697], y: [1.157] },
                            o: { x: [0.216], y: [0.197] },
                            t: 10.857,
                            s: [-92],
                          },
                          { t: 35, s: [0] },
                        ],
                        ix: 10,
                      },
                      p: { a: 0, k: [541.574, 541.896, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [132.516, 109.05, 0], ix: 1, l: 2 },
                      s: {
                        a: 1,
                        k: [
                          {
                            i: {
                              x: [0.242, 0.242, 0.667],
                              y: [1.188, 1.188, 1],
                            },
                            o: {
                              x: [0.347, 0.347, 0.333],
                              y: [0.161, 0.161, 0],
                            },
                            t: 18.173,
                            s: [0, 0, 100],
                          },
                          { t: 29.8583984375, s: [66, 66, 100] },
                        ],
                        ix: 6,
                        l: 2,
                      },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            ind: 0,
                            ty: "sh",
                            ix: 1,
                            ks: {
                              a: 0,
                              k: {
                                i: [
                                  [8.532, -8.533],
                                  [0, 0],
                                  [9.955, 11.378],
                                  [0, 0],
                                  [-9.955, 9.956],
                                  [-9.956, -9.955],
                                  [0, 0],
                                  [0, 0],
                                  [-9.955, -9.956],
                                ],
                                o: [
                                  [0, 0],
                                  [-9.956, 11.378],
                                  [0, 0],
                                  [-8.533, -9.956],
                                  [9.956, -8.533],
                                  [0, 0],
                                  [0, 0],
                                  [9.957, -9.956],
                                  [9.955, 8.533],
                                ],
                                v: [
                                  [123.734, -64.712],
                                  [-24.177, 97.423],
                                  [-61.155, 97.423],
                                  [-123.733, 27.734],
                                  [-122.311, -7.822],
                                  [-86.755, -6.4],
                                  [-42.666, 43.378],
                                  [86.755, -97.423],
                                  [122.311, -98.844],
                                ],
                                c: true,
                              },
                              ix: 2,
                            },
                            nm: "Path 1",
                            mn: "ADBE Vector Shape - Group",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.996, 0.996, 0.996], ix: 4 },
                            o: { a: 0, k: 100, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [132.516, 109.05], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Group 1",
                        np: 2,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                  {
                    ddd: 0,
                    ind: 3,
                    ty: 4,
                    nm: "Shape Layer 1",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: { a: 0, k: 0, ix: 10 },
                      p: { a: 0, k: [541.574, 539.945, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [33, -39, 0], ix: 1, l: 2 },
                      s: {
                        a: 1,
                        k: [
                          {
                            i: {
                              x: [0.639, 0.639, 0.667],
                              y: [1.203, 1.203, 1],
                            },
                            o: {
                              x: [0.418, 0.418, 0.333],
                              y: [-0.035, -0.035, 0],
                            },
                            t: 0,
                            s: [0, 0, 100],
                          },
                          { t: 26.162109375, s: [100, 100, 100] },
                        ],
                        ix: 6,
                        l: 2,
                      },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            d: 1,
                            ty: "el",
                            s: { a: 0, k: [282, 282], ix: 2 },
                            p: { a: 0, k: [0, 0], ix: 3 },
                            nm: "Ellipse Path 1",
                            mn: "ADBE Vector Shape - Ellipse",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.176, 0.851, 0.561], ix: 4 },
                            o: { a: 0, k: 100, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [33, -39], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Ellipse 1",
                        np: 3,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                ],
                markers: [],
              }
            : {
                v: "5.7.11",
                fr: 30,
                ip: 0,
                op: 60,
                w: 1080,
                h: 1080,
                nm: "Comp 1",
                ddd: 0,
                assets: [],
                layers: [
                  {
                    ddd: 0,
                    ind: 1,
                    ty: 4,
                    nm: "Shape Layer 2",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: { a: 0, k: 0, ix: 10 },
                      p: { a: 0, k: [540, 540, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
                      s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            d: 1,
                            ty: "el",
                            s: { a: 0, k: [240, 240], ix: 2 },
                            p: { a: 0, k: [0, 0], ix: 3 },
                            nm: "Ellipse Path 1",
                            mn: "ADBE Vector Shape - Ellipse",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.176, 0.851, 0.561], ix: 4 },
                            o: { a: 0, k: 0, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [67, 55], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Ellipse 1",
                        np: 3,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                  {
                    ddd: 0,
                    ind: 2,
                    ty: 4,
                    nm: "Layer 1 Outlines",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: {
                        a: 1,
                        k: [
                          {
                            i: { x: [0.697], y: [1.157] },
                            o: { x: [0.216], y: [0.197] },
                            t: 10.857,
                            s: [-92],
                          },
                          { t: 35, s: [0] },
                        ],
                        ix: 10,
                      },
                      p: { a: 0, k: [541.574, 541.896, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [132.516, 109.05, 0], ix: 1, l: 2 },
                      s: {
                        a: 1,
                        k: [
                          {
                            i: {
                              x: [0.242, 0.242, 0.667],
                              y: [1.188, 1.188, 1],
                            },
                            o: {
                              x: [0.347, 0.347, 0.333],
                              y: [0.161, 0.161, 0],
                            },
                            t: 18.173,
                            s: [0, 0, 100],
                          },
                          { t: 29.8583984375, s: [66, 66, 100] },
                        ],
                        ix: 6,
                        l: 2,
                      },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            ind: 0,
                            ty: "sh",
                            ix: 1,
                            ks: {
                              a: 0,
                              k: {
                                i: [
                                  [8.532, -8.533],
                                  [0, 0],
                                  [9.955, 11.378],
                                  [0, 0],
                                  [-9.955, 9.956],
                                  [-9.956, -9.955],
                                  [0, 0],
                                  [0, 0],
                                  [-9.955, -9.956],
                                ],
                                o: [
                                  [0, 0],
                                  [-9.956, 11.378],
                                  [0, 0],
                                  [-8.533, -9.956],
                                  [9.956, -8.533],
                                  [0, 0],
                                  [0, 0],
                                  [9.957, -9.956],
                                  [9.955, 8.533],
                                ],
                                v: [
                                  [123.734, -64.712],
                                  [-24.177, 97.423],
                                  [-61.155, 97.423],
                                  [-123.733, 27.734],
                                  [-122.311, -7.822],
                                  [-86.755, -6.4],
                                  [-42.666, 43.378],
                                  [86.755, -97.423],
                                  [122.311, -98.844],
                                ],
                                c: true,
                              },
                              ix: 2,
                            },
                            nm: "Path 1",
                            mn: "ADBE Vector Shape - Group",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.18, 0.18, 0.196], ix: 4 },
                            o: { a: 0, k: 100, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [132.516, 109.05], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Group 1",
                        np: 2,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                  {
                    ddd: 0,
                    ind: 3,
                    ty: 4,
                    nm: "Shape Layer 1",
                    sr: 1,
                    ks: {
                      o: { a: 0, k: 100, ix: 11 },
                      r: { a: 0, k: 0, ix: 10 },
                      p: { a: 0, k: [541.574, 539.945, 0], ix: 2, l: 2 },
                      a: { a: 0, k: [33, -39, 0], ix: 1, l: 2 },
                      s: {
                        a: 1,
                        k: [
                          {
                            i: {
                              x: [0.639, 0.639, 0.667],
                              y: [1.203, 1.203, 1],
                            },
                            o: {
                              x: [0.418, 0.418, 0.333],
                              y: [-0.035, -0.035, 0],
                            },
                            t: 0,
                            s: [0, 0, 100],
                          },
                          { t: 26.162109375, s: [100, 100, 100] },
                        ],
                        ix: 6,
                        l: 2,
                      },
                    },
                    ao: 0,
                    shapes: [
                      {
                        ty: "gr",
                        it: [
                          {
                            d: 1,
                            ty: "el",
                            s: { a: 0, k: [282, 282], ix: 2 },
                            p: { a: 0, k: [0, 0], ix: 3 },
                            nm: "Ellipse Path 1",
                            mn: "ADBE Vector Shape - Ellipse",
                            hd: false,
                          },
                          {
                            ty: "fl",
                            c: { a: 0, k: [0.176, 0.851, 0.561], ix: 4 },
                            o: { a: 0, k: 100, ix: 5 },
                            r: 1,
                            bm: 0,
                            nm: "Fill 1",
                            mn: "ADBE Vector Graphic - Fill",
                            hd: false,
                          },
                          {
                            ty: "tr",
                            p: { a: 0, k: [33, -39], ix: 2 },
                            a: { a: 0, k: [0, 0], ix: 1 },
                            s: { a: 0, k: [100, 100], ix: 3 },
                            r: { a: 0, k: 0, ix: 6 },
                            o: { a: 0, k: 100, ix: 7 },
                            sk: { a: 0, k: 0, ix: 4 },
                            sa: { a: 0, k: 0, ix: 5 },
                            nm: "Transform",
                          },
                        ],
                        nm: "Ellipse 1",
                        np: 3,
                        cix: 2,
                        bm: 0,
                        ix: 1,
                        mn: "ADBE Vector Group",
                        hd: false,
                      },
                    ],
                    ip: 0,
                    op: 150,
                    st: 0,
                    bm: 0,
                  },
                ],
                markers: [],
              },
      });
      anim.setSpeed(1.5);

      return () => {
        anim.destroy();
      };
    }
  }, []);

  return (
    <div
      ref={checkAnimDivRef}
      style={{
        width: 16,
        height: 16,
        transform: "scale(3.2)",
      }}
    />
  );
};
