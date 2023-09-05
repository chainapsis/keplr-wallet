import React, { FunctionComponent, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { Box } from "../../components/box";
import styled from "styled-components";
import { ColorPalette, GlobalStyle } from "../../styles";
import { AppThemeProvider } from "../../theme";

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
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["gray-10"]};

    @media screen and (max-height: 48rem) {
      font-size: 2rem;
    }
  `,
  Description: styled.div`
    font-weight: 400;
    font-size: 1rem;
    margin: 1.75rem 0;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-100"]};

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
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["gray-50"]};

    display: flex;
    justify-content: center;
  `,
};

// blocklist page를 manifest의 web_accessible_resources 필드에서 빼기 위해서 약간 희한한 구조를 가지게 되었다.
// 이렇게 되면, manifest에 있는 web_accessible_resources 필드에 있는 파일들은 content script에서 접근할 수 없게 된다.
// 그래서, content script에서는 이 페이지를 열 수 없게 되는데, 그래서 이 페이지는 실제 웹페이지로 존재해야한다. (웹페이지로 올리는 건 알아서 처리 해야됨)
// 웹페이지에서 직접 phishing site에 대한 임시 허가 메세지를 백그라운드로 보낼 수 없으므로 content script를 통해서 보내야한다.
// content script는 등록된 blocklist page일 경우에는 window의 postMessage를 통해서 요청을 받아서 대신 백그라운드로 메세지를 보내준다.
// 이 경우 type을 "allow-temp-blocklist-url"로 설정해서 웹페이지에서 content script로 메세지를 보내면 된다.
// 역으로 content script에서 임시 허가 메세지를 백그라운드로 보내고 난 후에는 웹페이지로 "blocklist-url-temp-allowed" 메세지를 보내준다.
// 이 메세지를 웹페이지에서 받으면 block됐던 웹사이트로 리다이렉트 시키면 된다.
// XXX: 참고로 완전히 분리된 웹페이지이기 때문에 extension의 language, theme 세팅을 따르지 않는다...
export const BlocklistPage: FunctionComponent = () => {
  const origin =
    new URLSearchParams(window.location.search).get("origin") || "";

  useLayoutEffect(() => {
    const onRedirectMessage = (e: any) => {
      try {
        if (e.data.type !== "blocklist-url-temp-allowed") {
          return;
        }
        const redirectUrl = new URL(e.data.origin);

        // Validate url
        const url = new URL(origin);
        if (redirectUrl.origin !== url.origin) {
          throw new Error("origin unmatched");
        }

        window.location.replace(origin);
      } catch (e) {
        console.log(e);
        alert(e.message || e.toString());
      }
    };

    window.addEventListener("message", onRedirectMessage);

    return () => {
      window.removeEventListener("message", onRedirectMessage);
    };
  }, [origin]);

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
          <Styles.Link>
            <div
              onClick={(e) => {
                e.preventDefault();

                window.postMessage(
                  {
                    type: "allow-temp-blocklist-url",
                    origin,
                  },
                  window.location.origin
                );
              }}
              style={{
                cursor: "pointer",
              }}
            >
              Continue to {origin} (unsafe)
            </div>
          </Styles.Link>
        </Box>
      </Styles.Inner>
    </Box>
  );
};

ReactDOM.render(
  <React.Fragment>
    <AppThemeProvider>
      <GlobalStyle />
      <BlocklistPage />
    </AppThemeProvider>
  </React.Fragment>,
  document.getElementById("app")
);
