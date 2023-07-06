import React, { FunctionComponent, useState } from "react";
import { Modal } from "../../../../components/modal";
import { HeaderLayout } from "../../../../layouts/header";
import { KeystoneDisplay } from "./display";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { KeystoneScan } from "./scan";
import { ArrowLeftIcon } from "../../../../components/icon";

export const KeystoneSign: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = ({ isOpen, close }) => {
  const [step, setStep] = useState("display");
  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <HeaderLayout
        title="Scan the QR Code"
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
            background: ColorPalette["gray-700"],
          }}
        >
          {step === "display" ? (
            <KeystoneDisplay
              onGetSignature={() => {
                setStep("scan");
              }}
            />
          ) : (
            <KeystoneScan />
          )}
        </Box>
      </HeaderLayout>
    </Modal>
  );
};
