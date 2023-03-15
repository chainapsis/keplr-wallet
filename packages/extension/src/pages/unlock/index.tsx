import React, { FunctionComponent, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { useInteractionInfo } from "../../hooks";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    interactionStore.rejectAll("unlock");
  });
  const [password, setPassword] = useState("");

  // TODO: Split usage of interaction store to other store?
  // TODO: Use "form"
  // TODO: Add loading indicator
  return (
    <div>
      <TextInput
        value={password}
        onChange={(e) => {
          e.preventDefault();

          setPassword(e.target.value);
        }}
      />
      <Button
        text="Unlock"
        onClick={async () => {
          await keyRingStore.unlock(password);

          if (interactionInfo.interaction) {
            let remainUIAfterInteraction = false;
            // Approve all waiting interaction for the enabling key ring.
            for (const interaction of interactionStore.getDatas<{
              remainUIAfterInteraction: boolean;
            }>("unlock")) {
              if (interaction.data.remainUIAfterInteraction) {
                remainUIAfterInteraction = true;
              }
              await interactionStore.approve("unlock", interaction.id, {});
              if (
                !interactionInfo.interactionInternal &&
                !remainUIAfterInteraction
              ) {
                window.close();
              }
            }
          }
        }}
      />
    </div>
  );
});
