import React, { FunctionComponent, useContext, useState } from "react";
import { ConfirmModal } from "./modal";

export type ConfirmModalContextProps = Omit<
  React.ComponentProps<typeof ConfirmModal>,
  "isOpen" | "close" | "children" | "onSelectYes" | "onSelectNo"
>;

export interface ConfirmModal {
  /**
   * confirm requests users to choose to continue procedure or cancel it.
   * If users choose to cancel, this will return false.
   * @param props
   */
  confirm(props: ConfirmModalContextProps): Promise<boolean>;
}

export const ConfirmModalContext = React.createContext<ConfirmModal | null>(
  null
);

export const ConfirmModalProvider: FunctionComponent = ({ children }) => {
  const [waitingConfirms, setWaitingConfirms] = useState<
    (ConfirmModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    })[]
  >([]);

  const onSelectConfirm = (
    confirm: ConfirmModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    },
    yes: boolean
  ) => {
    return () => {
      const selectedIndex = waitingConfirms.findIndex(
        (waiting) => waiting.key === confirm.key
      );
      if (selectedIndex >= 0) {
        const selected = waitingConfirms[selectedIndex];
        selected.resolver(yes);
        const confirms = waitingConfirms.slice();
        confirms.splice(selectedIndex, 1);
        setWaitingConfirms(confirms);
      }
    };
  };

  return (
    <ConfirmModalContext.Provider
      value={{
        confirm(props: ConfirmModalContextProps): Promise<boolean> {
          return new Promise<boolean>((resolve) => {
            const key = waitingConfirms.length.toString();
            const confirms = waitingConfirms.slice();

            confirms.push({
              ...props,
              key,
              resolver: resolve,
            });

            setWaitingConfirms(confirms);
          });
        },
      }}
    >
      {children}
      {waitingConfirms.map((confirm) => {
        return (
          <ConfirmModal
            key={confirm.key}
            isOpen={true}
            close={onSelectConfirm(confirm, false)}
            onSelectYes={onSelectConfirm(confirm, true)}
            onSelectNo={onSelectConfirm(confirm, false)}
            title={confirm.title}
            paragraph={confirm.paragraph}
            yesButtonText={confirm.yesButtonText}
            noButtonText={confirm.noButtonText}
          />
        );
      })}
    </ConfirmModalContext.Provider>
  );
};

export const useConfirmModal = () => {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error("You forgot to use ConfirmModalContext");
  }
  return context;
};

export * from "./modal";
