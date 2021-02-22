import React, {
  createContext,
  FunctionComponent,
  useContext,
  useState,
} from "react";
import { Modal } from "reactstrap";

import style from "./style.module.scss";

export interface LoadingState {
  setIsLoading(type: string, isLoading: boolean): void;
}

const LoadingIndicatorContext = createContext<LoadingState | undefined>(
  undefined
);

export const LoadingIndicatorProvider: FunctionComponent = ({ children }) => {
  const [loadingList, setLoadingList] = useState<
    {
      type: string;
      isLoading: boolean;
    }[]
  >([]);

  const isLoading = loadingList.find((loading) => loading.isLoading) != null;

  return (
    <LoadingIndicatorContext.Provider
      value={{
        setIsLoading: (type: string, isLoading: boolean) => {
          const loading = loadingList.find((loading) => loading.type === type);

          if (loading) {
            if (loading.isLoading === isLoading) {
              return;
            }
            loading.isLoading = isLoading;
            setLoadingList(loadingList.concat());
          } else {
            setLoadingList(
              loadingList.concat({
                type,
                isLoading,
              })
            );
          }
        },
      }}
    >
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
