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
    ConfirmModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    }
  >();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const onSelectConfirm = (
    confirm: ConfirmModalContextProps & {
      key: string;
      resolver: (result: boolean) => void;
    },
    yes: boolean
  ) => {
    return () => {
      confirm.resolver(yes);
      setWaitingConfirms(confirm);
      setOpenModal(false);
    };
  };

  return (
    <ConfirmModalContext.Provider
      value={{
        confirm(props: ConfirmModalContextProps): Promise<boolean> {
          return new Promise<boolean>((resolve) => {
            const confirms = {
              ...props,
              key: "0",
              resolver: resolve,
            };
            setWaitingConfirms(confirms);
            setOpenModal(true);
          });
        },
      }}
    >
      {children}
      {waitingConfirms ? (
        <ConfirmModal
          key={waitingConfirms.key}
          isOpen={openModal}
          close={onSelectConfirm(waitingConfirms, false)}
          onSelectYes={onSelectConfirm(waitingConfirms, true)}
          onSelectNo={onSelectConfirm(waitingConfirms, false)}
          title={waitingConfirms.title}
          paragraph={waitingConfirms.paragraph}
          yesButtonText={waitingConfirms.yesButtonText}
          noButtonText={waitingConfirms.noButtonText}
        />
      ) : null}
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
