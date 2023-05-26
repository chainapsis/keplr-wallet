import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { URLTempAllowMsg } from "@keplr-wallet/background";
import { Box } from "../../components/box";
import styled from "styled-components";
import { ColorPalette, GlobalStyle } from "../../styles";

const Styles = {
  Inner: styled.div`
    display: flex;
    align-items: center;

    text-align: left;
    padding: 1.5rem;
    max-width: 64rem;

    gap: 3.375rem;

    @media screen and (max-height: 48rem) {
      flex-direction: column;
      text-align: center;
    }
  `,
  Image: styled.img`
    @media screen and (max-height: 48rem) {
      margin: 0 auto;
      max-width: max(60%, 16.25rem);
    }
  `,
  Title: styled.div`
    font-weight: 600;
    font-size: 3rem;
    margin: 0;
    color: ${ColorPalette["gray-10"]};

    @media screen and (max-height: 48rem) {
      font-size: 2rem;
    }
  `,
  Description: styled.div`
    font-weight: 400;
    font-size: 1rem;
    margin: 1.75rem 0;
    color: ${ColorPalette["gray-100"]};

    @media screen and (max-height: 48rem) {
      max-width: max(75%, 20rem);
      margin: 1.25rem auto;
    }
  `,
  Link: styled.button`
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    text-decoration: underline;
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: -0.005em;
    color: ${ColorPalette["gray-50"]};
  `,
};

export const BlocklistPage: FunctionComponent = () => {
  const origin =
    new URLSearchParams(window.location.search).get("origin") || "";

  const handleMove = () =>
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new URLTempAllowMsg(origin))
      .then(() => {
        window.location.replace(origin);
      });

  return (
    <Box width="100vw" height="100vh" alignX="center" alignY="center">
      <Styles.Inner>
        <Styles.Image
          src={require("../../public/assets/img/blocklist.svg")}
          alt=""
        />
        <Box>
          <Styles.Title>SECURITY ALERT</Styles.Title>
          <Styles.Description>
            Keplr has detected that this domain has been flagged as a phishing
            site. To protect the safety of your assets, we recommend you exit
            this website immediately.
          </Styles.Description>
          <Styles.Link onClick={handleMove}>
            Continue to {origin} (unsafe)
          </Styles.Link>
        </Box>
      </Styles.Inner>
    </Box>
  );
};

ReactDOM.render(
  <React.Fragment>
    <GlobalStyle />
    <BlocklistPage />
  </React.Fragment>,
  document.getElementById("app")
);
