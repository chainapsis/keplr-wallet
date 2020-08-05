import React, {
  createContext,
  FunctionComponent,
  useContext,
  useState
} from "react";
import { Modal } from "reactstrap";

import style from "./style.module.scss";

export interface LoadingState {
  isLoading: boolean;
  setIsLoading(isLoading: boolean): void;
}

const LoadingIndicatorContext = createContext<LoadingState | undefined>(
  undefined
);

export const LoadingIndicatorProvider: FunctionComponent = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <LoadingIndicatorContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading ? (
        <Modal
          modalClassName={style.modal}
          contentClassName={style.modalContentEmpty}
          isOpen
          centered
        >
          <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
        </Modal>
      ) : null}
      {children}
    </LoadingIndicatorContext.Provider>
  );
};

export function useLoadingIndicator() {
  const state = useContext(LoadingIndicatorContext);
  if (!state)
    throw new Error("You probably forgot to use LoadingIndicatorProvider");
  return state;
}
