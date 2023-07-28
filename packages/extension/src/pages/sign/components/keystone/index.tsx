import React, { FunctionComponent, useState } from "react";
import { Modal } from "../../../../components/modal";
import { HeaderLayout } from "../../../../layouts/header";
import { KeystoneDisplay } from "./display";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { KeystoneScan } from "./scan";
import { ArrowLeftIcon } from "../../../../components/icon";
import { KeystoneUR } from "../../utils/keystone";
import { useTheme } from "styled-components";
import { useIntl } from "react-intl";

export const KeystoneSign: FunctionComponent<{
  ur?: KeystoneUR;
  isOpen: boolean;
  close: () => void;
  onScan: (ur: KeystoneUR) => void;
}> = ({ ur, isOpen, close, onScan }) => {
  const [step, setStep] = useState("display");
  const theme = useTheme();
  const intl = useIntl();
  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <HeaderLayout
        title={intl.formatMessage({
          id: "page.sign.keystone.title",
        })}
        left={
          <Box
            paddingLeft="1rem"
            cursor="pointer"
            onClick={() => {
              if (step === "display") {
                close();
              } else {
                setStep("display");
              }
            }}
          >
            <ArrowLeftIcon />
          </Box>
        }
      >
        <Box
          style={{
            background:
              theme.mode === "light" ? "#fbfbff" : ColorPalette["gray-700"],
          }}
        >
          {step === "display" ? (
            <KeystoneDisplay
              ur={ur}
              onGetSignature={() => {
                setStep("scan");
              }}
            />
          ) : (
            <KeystoneScan onScan={onScan} />
          )}
        </Box>
      </HeaderLayout>
    </Modal>
  );
};
