import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { useInteractionInfo } from "../../hooks";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { Image } from "../../components/image";
import { TextButton } from "../../components/button-text";
import { ColorPalette } from "../../styles";
import { H1 } from "../../components/typography";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    interactionStore.rejectAll("unlock");
  });
  const [password, setPassword] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Focus the input element at start.
      inputRef.current.focus();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          setIsLoading(true);

          await keyRingStore.unlock(password);

          if (interactionInfo.interaction) {
            let _proceedNext = false;
            const promises: Promise<unknown>[] = [];
            // Approve all waiting interaction for the enabling key ring.
            const interactions = interactionStore.getAllData("unlock");
            for (const interaction of interactions) {
              promises.push(
                (async () => {
                  await interactionStore.approveWithProceedNextV2(
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

          setError(undefined);
        } catch (e) {
          console.log(e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <Box alignX="center">
        <Gutter size="7.375rem" />

        <Image
          src={require("../../public/assets/img/unlock.png")}
          alt={"unlock image"}
          style={{
            width: "12rem",
            height: "9.5rem",
          }}
        />
        <H1>Welcome Back</H1>

        <Gutter size="1.75rem" />

        <TextInput
          ref={inputRef}
          label="Password"
          type="password"
          value={password}
          style={{ width: "100%" }}
          onChange={(e) => {
            e.preventDefault();

            setPassword(e.target.value);

            // Clear error if the user is typing.
            setError(undefined);
          }}
          error={error ? "Invalid password" : undefined}
        />

        <Gutter size="2.125rem" />

        <Button
          type="submit"
          text="Unlock"
          size="large"
          disabled={password.length === 0}
          style={{ width: "100%" }}
          isLoading={
            isLoading ||
            (() => {
              if (interactionInfo.interaction) {
                const interactions = interactionStore.getAllData("unlock");
                for (const interaction of interactions) {
                  if (interactionStore.isObsoleteInteraction(interaction.id)) {
                    return true;
                  }
                }
              }
              return false;
            })()
          }
        />

        <Gutter size="3.125rem" />

        <TextButton
          text="Forgot Password?"
          type="button"
          size="small"
          color="faint"
          onClick={() => {}}
          style={{ width: "100%", color: ColorPalette["gray-300"] }}
        />
      </Box>
    </form>
  );
});
