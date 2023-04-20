import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { GuideBox } from "../../../../components/guide-box";
import { Stack } from "../../../../components/stack";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle3 } from "../../../../components/typography";
import { TextInput } from "../../../../components/input";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  Bold: styled.span`
    color: ${ColorPalette["gray-10"]};
    text-decoration: underline;
  `,
  Paragraph: styled(Subtitle3)`
    text-align: center;
    color: ${ColorPalette["gray-200"]};
    padding: 0 0.625rem;
  `,
};

export const SettingGeneralLinkKeplrMobilePage: FunctionComponent = observer(
  () => {
    const [keyringDatas, setKeyringDatas] = useState<string[]>([]);

    return keyringDatas.length === 0 ? (
      <EnterPasswordView onClick={() => setKeyringDatas(["1"])} />
    ) : (
      <QRCodeView />
    );
  }
);

const EnterPasswordView: FunctionComponent<{ onClick: () => void }> = observer(
  ({ onClick }) => {
    return (
      <HeaderLayout
        title="Link Keplr Mobile"
        left={<BackButton />}
        bottomButton={{
          color: "secondary",
          text: "Confirm",
          size: "large",
          onClick,
        }}
      >
        <Styles.Container>
          <GuideBox
            title="Only scan on Keplr Mobile"
            paragraph={
              <div>
                Scanning the QR code outside of Keplr Mobile can lead to loss of
                funds
              </div>
            }
          />
          <Styles.Paragraph>
            Scan QR code to export accounts to Keplr Mobile. The process may
            take several minutes.
          </Styles.Paragraph>

          <TextInput label="Password" type="password" />
        </Styles.Container>
      </HeaderLayout>
    );
  }
);

const QRCodeView: FunctionComponent = observer(() => {
  return (
    <HeaderLayout title="Link Keplr Mobile" left={<BackButton />}>
      <Styles.Container>
        <Styles.Paragraph>
          Scan QR code to export accounts to Keplr Mobile. The process may take
          several minutes.
        </Styles.Paragraph>
      </Styles.Container>
    </HeaderLayout>
  );
});
