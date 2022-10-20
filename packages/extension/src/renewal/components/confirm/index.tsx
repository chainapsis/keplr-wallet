import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ModalBody, Modal } from "reactstrap";

import { ConfirmDialog } from "./dialog";

import style from "./style.module.scss";

export interface ConfirmOptions {
  img?: React.ReactElement;
  title?: string;
  paragraph: string;

  yes?: string;
  no?: string;
}

const ConfirmContext = createContext<
  | {
      confirm: (options: ConfirmOptions) => Promise<boolean>;
    }
  | undefined
>(undefined);

export const ConfirmProvider: FunctionComponent = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentConfirm, setCurrentConfirm] = useState<
    (ConfirmOptions & { resolve: () => void; reject: () => void }) | null
  >(null);

  // Confirm method returns true if user confirmed the behavior or returns false if user reject to continue the behavior asynchronously.
  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      // If a previous request exists, reject the previous request.
      if (currentConfirm) {
        currentConfirm.reject();
      }

      return new Promise<boolean>((resolve) => {
        let resolved = false;

        // Resolver resolves `true` and close the dialog.
        const resolver = () => {
          if (resolved) return;

          resolved = true;
          setIsDialogOpen(false);
          resolve(true);
        };
        // Rejector resolves `false` and close the dialog.
        // Rejector doesn't reject promise with an error.
        const rejector = () => {
          if (resolved) return;

          resolved = true;
          setIsDialogOpen(false);
          resolve(false);
        };

        setCurrentConfirm(
          Object.assign({}, options, {
            resolve: resolver,
            reject: rejector,
          })
        );
        setIsDialogOpen(true);
      });
    },
    [currentConfirm]
  );

  // When the dialog closing transition ends, clear the current confirm information.
  // This is recommended because if you clear the confirm information before the closing transition ends, the confirm information is not rendered during closing.
  const clearCurrentConfirm = useCallback(() => {
    setCurrentConfirm(null);
  }, []);

  return (
    <ConfirmContext.Provider
      value={useMemo(() => {
        return { confirm };
      }, [confirm])}
    >
      <Modal
        isOpen={isDialogOpen}
        centered
        className={style.modalDialog}
        onClosed={clearCurrentConfirm}
      >
        <ModalBody className={style.modal}>
          <ConfirmDialog
            img={currentConfirm?.img}
            title={currentConfirm?.title}
            paragraph={
              currentConfirm?.paragraph
                ? currentConfirm.paragraph
                : "Unexpected. Something is wrong."
            }
            yes={currentConfirm?.yes}
            no={currentConfirm?.no}
            onConfirm={currentConfirm?.resolve}
            onReject={currentConfirm?.reject}
          />
        </ModalBody>
      </Modal>
      {children}
    </ConfirmContext.Provider>
  );
};

/**
 * Confirm method returns `true` or `false` asynchronously.
 * Please note that this request does not allow nesting.
 */
export function useConfirm() {
  const state = useContext(ConfirmContext);
  if (!state) throw new Error("You probably forgot to use ConfirmProvider");
  return state;
}
