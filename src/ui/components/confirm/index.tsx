import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { ModalBody, Modal } from "reactstrap";

import { ConfirmDialog } from "./dialog";

import style from "./style.module.scss";

export interface ConfirmOptions {
  img?: React.ReactElement;
  title?: string;
  paragraph: string;
}

const ConfirmContext = createContext<
  | {
      confirm: (options: ConfirmOptions) => Promise<boolean>;
    }
  | undefined
>(undefined);

export const ConfirmProvider: FunctionComponent = ({ children }) => {
  const [currentConfirm, setCurrentConfirm] = useState<
    (ConfirmOptions & { resolve: () => void; reject: () => void }) | null
  >(null);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      if (currentConfirm) {
        currentConfirm.reject();
      }

      return new Promise<boolean>(resolve => {
        const resolver = () => {
          resolve(true);
          setCurrentConfirm(null);
        };
        const rejector = () => {
          resolve(false);
          setCurrentConfirm(null);
        };

        setCurrentConfirm(
          Object.assign({}, options, {
            resolve: resolver,
            reject: rejector
          })
        );
      });
    },
    [currentConfirm]
  );

  return (
    <ConfirmContext.Provider
      value={useMemo(() => {
        return { confirm };
      }, [confirm])}
    >
      <Modal
        isOpen={currentConfirm != null}
        centered
        className={style.modalDialog}
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
            onConfirm={currentConfirm?.resolve}
            onReject={currentConfirm?.reject}
          />
        </ModalBody>
      </Modal>
      {children}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const state = useContext(ConfirmContext);
  if (!state) throw new Error("You probably forgot to use ConfirmProvider");
  return state;
}
