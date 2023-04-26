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
            let _proceedNext = false;
            const promises: Promise<unknown>[] = [];
            // Approve all waiting interaction for the enabling key ring.
            const interactions = interactionStore.getAllData("unlock");
            for (const interaction of interactions) {
              promises.push(
                (async () => {
                  await interactionStore.approveWithProceedNext(
                    interaction.id,
                    {},
                    (proceedNext) => {
                      if (proceedNext) {
                        _proceedNext = true;
                      }
                    }
                  );
                })()
              );
            }

            // 실패할리가 없지만... 실패했다고 해도 별 방법은 없으니 settled로...
            await Promise.allSettled(promises);

            if (!_proceedNext) {
              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
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
