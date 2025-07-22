import React, { FunctionComponent } from "react";
import { Modal } from "../../../components/modal";
import { XAxis, YAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { H3, Body2 } from "../../../components/typography";
import { Button } from "../../../components/button";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import styled from "styled-components";

export const ConnectLedgerModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  ledgerApp: string;
  vaultId: string;
  chainId: string;
  openEnableChains?: boolean;
}> = ({ isOpen, close, ledgerApp, vaultId, chainId, openEnableChains }) => {
  const intl = useIntl();
  const theme = useTheme();

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} align="bottom" close={close} maxHeight="95vh">
      <Styles.Container>
        <YAxis alignX="center" gap="1.5rem">
          <Box
            width="2.5rem"
            height="0.3125rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }
            borderRadius="1.4375rem"
          />

          <YAxis alignX="center" gap="1.25rem">
            <XAxis alignY="center" gap="0.5rem">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M10 7.6875V10.8125M17.5 10.1875C17.5 14.3296 14.1421 17.6875 10 17.6875C5.85786 17.6875 2.5 14.3296 2.5 10.1875C2.5 6.04536 5.85786 2.6875 10 2.6875C14.1421 2.6875 17.5 6.04536 17.5 10.1875ZM10 13.3125H10.0063V13.3188H10V13.3125Z"
                  stroke={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette.white
                  }
                  strokeWidth="2.08333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <H3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette.white
                }
              >
                {intl.formatMessage({
                  id: "pages.manage-chains.connect-ledger-modal.title",
                })}
              </H3>
            </XAxis>
            <LedgerIllustration />
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
              style={{ textAlign: "center", lineHeight: "140%" }}
            >
              {intl.formatMessage(
                {
                  id: "pages.manage-chains.connect-ledger-modal.paragraph",
                },
                {
                  br: <br />,
                }
              )}
            </Body2>
          </YAxis>

          <Box width="21rem" marginX="auto">
            <Button
              text={intl.formatMessage({
                id: "pages.manage-chains.connect-ledger-modal.button",
              })}
              size="large"
              onClick={() => {
                browser.tabs.create({
                  url: openEnableChains
                    ? `/register.html#?route=enable-chains&vaultId=${vaultId}&skipWelcome=true`
                    : `/register.html#?route=connect-ledger&vaultId=${vaultId}&skipWelcome=true&ledgerApp=${ledgerApp}&afterEnableChains=${chainId}`,
                });

                close();
              }}
              right={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  style={{
                    stroke: "none",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.5999 6.59844C5.10285 6.59844 4.6999 7.00138 4.6999 7.49844V17.6984C4.6999 18.1955 5.10285 18.5984 5.5999 18.5984H15.7999C16.297 18.5984 16.6999 18.1955 16.6999 17.6984V12.8984C16.6999 12.4014 17.1028 11.9984 17.5999 11.9984C18.097 11.9984 18.4999 12.4014 18.4999 12.8984V17.6984C18.4999 19.1896 17.2911 20.3984 15.7999 20.3984H5.5999C4.10873 20.3984 2.8999 19.1896 2.8999 17.6984V7.49844C2.8999 6.00727 4.10873 4.79844 5.5999 4.79844H11.5999C12.097 4.79844 12.4999 5.20138 12.4999 5.69844C12.4999 6.19549 12.097 6.59844 11.5999 6.59844H5.5999Z"
                    fill="#9DACF4"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.93252 15.3023C8.266 15.6708 8.83514 15.6993 9.20372 15.3658L20.2999 5.32642V8.69844C20.2999 9.19549 20.7028 9.59844 21.1999 9.59844C21.697 9.59844 22.0999 9.19549 22.0999 8.69844V3.29844C22.0999 2.80138 21.697 2.39844 21.1999 2.39844H15.7999C15.3028 2.39844 14.8999 2.80138 14.8999 3.29844C14.8999 3.79549 15.3028 4.19844 15.7999 4.19844H18.8637L7.99608 14.0311C7.6275 14.3645 7.59904 14.9337 7.93252 15.3023Z"
                    fill="#9DACF4"
                  />
                </svg>
              }
            />
          </Box>
        </YAxis>
      </Styles.Container>
    </Modal>
  );
};

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.75rem;
    padding-top: 0.88rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

const LedgerIllustration: FunctionComponent = () => {
  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="122"
        height="122"
        viewBox="0 0 122 122"
        fill="none"
      >
        <path
          d="M17.8438 79.8477L17.8437 53.2147C17.8437 49.6828 20.707 46.8196 24.2389 46.8196L99.5235 46.8195C103.055 46.8195 105.919 49.6828 105.919 53.2147L105.919 73.4525C105.919 76.9844 103.055 79.8477 99.5235 79.8477L17.8438 79.8477Z"
          fill="#202330"
        />
        <rect
          x="16.8428"
          y="72.8438"
          width="30.0255"
          height="89.0758"
          rx="9.13598"
          transform="rotate(-90 16.8428 72.8438)"
          fill="url(#paint0_linear_19037_83689)"
        />
        <rect
          x="44.3779"
          y="66.0703"
          width="17.042"
          height="34.084"
          rx="4.56799"
          transform="rotate(-90 44.3779 66.0703)"
          fill="black"
        />
        <path
          d="M16.8428 46.4924C16.8428 44.4638 18.4873 42.8192 20.516 42.8192L90.9058 42.8192C99.1971 42.8192 105.919 49.5406 105.919 57.832C105.919 66.1233 99.1971 72.8447 90.9058 72.8447L21.3466 72.8447C19.412 72.8447 17.8436 74.4131 17.8436 76.3477C17.8436 78.2824 19.412 79.8507 21.3466 79.8507L97.9118 79.8507C97.9118 80.4035 97.4637 80.8516 96.9109 80.8516L20.8462 80.8516C18.6352 80.8516 16.8428 79.0592 16.8428 76.8482L16.8428 46.4924Z"
          fill="url(#paint1_linear_19037_83689)"
        />
        <circle
          cx="91.404"
          cy="58.3326"
          r="8.50724"
          transform="rotate(-90 91.404 58.3326)"
          fill="#92AEC3"
        />
        <ellipse
          cx="91.4038"
          cy="58.3296"
          rx="7.50639"
          ry="7.50639"
          transform="rotate(-90 91.4038 58.3296)"
          fill="url(#paint2_linear_19037_83689)"
        />
        <path
          d="M70.227 64.7673V65.8384H77.8957V61.0075H76.7783V64.7673H70.227ZM70.227 48.8242V49.8954H76.7783V53.6554H77.8957V48.8242H70.227ZM66.2723 57.1109V54.6219H68.0252C68.8798 54.6219 69.1865 54.8949 69.1865 55.6407V56.0817C69.1865 56.8484 68.8906 57.1109 68.0252 57.1109H66.2723ZM69.0548 57.552C69.8544 57.3524 70.4131 56.6381 70.4131 55.7876C70.4131 55.252 70.1941 54.7688 69.7779 54.3801C69.252 53.8969 68.5507 53.6554 67.6415 53.6554H65.1766V61.0072H66.2723V58.0771H67.9156C68.7591 58.0771 69.0988 58.4132 69.0988 59.2535V61.0075H70.2162V59.4216C70.2162 58.2663 69.9314 57.8252 69.0548 57.6992V57.552ZM59.8307 57.7935H63.205V56.8273H59.8307V54.6216H63.5336V53.6554H58.7131V61.0072H63.6979V60.041H59.8307V57.7935ZM56.1605 58.1821V58.6862C56.1605 59.7469 55.7551 60.0936 54.7364 60.0936H54.4954C53.4764 60.0936 52.9835 59.7785 52.9835 58.3186V56.344C52.9835 54.8738 53.4985 54.569 54.5171 54.569H54.7361C55.7331 54.569 56.0508 54.9261 56.0616 55.9134H57.2668C57.1573 54.464 56.1494 53.5505 54.6375 53.5505C53.9036 53.5505 53.2901 53.7711 52.83 54.191C52.1398 54.8107 51.7564 55.8611 51.7564 57.3313C51.7564 58.7492 52.0851 59.7996 52.7643 60.4505C53.2243 60.8812 53.8598 61.1122 54.4843 61.1122C55.1415 61.1122 55.7442 60.86 56.0508 60.314H56.204V61.0072H57.2119V57.2159H54.243V58.1821H56.1605ZM46.4982 54.6216H47.6924C48.8209 54.6216 49.4345 54.8946 49.4345 56.3651V58.2975C49.4345 59.7678 48.8209 60.041 47.6924 60.041H46.4982V54.6216ZM47.7909 61.0075C49.8834 61.0075 50.661 59.4846 50.661 57.3316C50.661 55.147 49.8285 53.6557 47.7688 53.6557H45.4024V61.0075H47.7909ZM40.1113 57.7935H43.4856V56.8273H40.1113V54.6216H43.8141V53.6554H38.9936V61.0072H43.9786V60.041H40.1113V57.7935ZM33.6477 53.6554H32.5304V61.0072H37.5698V60.041H33.6477V53.6554ZM24.8506 61.0075V65.8387H32.5192V64.7673H25.9679V61.0075H24.8506ZM24.8506 48.8242V53.6554H25.9679V49.8954H32.5192V48.8242H24.8506Z"
          fill="#92AEC3"
        />
        <defs>
          <linearGradient
            id="paint0_linear_19037_83689"
            x1="31.8555"
            y1="72.8438"
            x2="31.8555"
            y2="161.92"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#414866" />
            <stop offset="1" stopColor="#2F3652" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_19037_83689"
            x1="16.8428"
            y1="67.7981"
            x2="85.6129"
            y2="26.2959"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D3E4F0" />
            <stop offset="1" stopColor="#B6CBDB" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_19037_83689"
            x1="91.4038"
            y1="50.8232"
            x2="91.4038"
            y2="65.8359"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#DCEEFD" />
            <stop offset="1" stopColor="#BACEDE" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};
