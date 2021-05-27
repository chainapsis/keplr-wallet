import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import Modal from "react-native-modal";
import { m0, sf, flex1, justifyContentEnd } from "../styles";

import { UnlockView } from "./unlock";
import { SignView } from "./sign";
import { DialogView } from "./dialog";
import { AddressBookView } from "./address-book";

export const ModalsRenderer: FunctionComponent = observer(() => {
  const { interactionModalStore } = useStore();

  return (
    <Modal
      isVisible={interactionModalStore.lastUrl != null}
      style={sf([flex1, m0, justifyContentEnd])}
      onBackdropPress={() => {
        interactionModalStore.popUrl();
      }}
    >
      {interactionModalStore.lastUrl === "/unlock" ? <UnlockView /> : null}
      {interactionModalStore.lastUrl === "/sign" ? <SignView /> : null}
      {interactionModalStore.lastUrl === "/dialog" ? <DialogView /> : null}
      {interactionModalStore.lastUrl === "/address-book" ? (
        <AddressBookView />
      ) : null}
    </Modal>
  );
});
