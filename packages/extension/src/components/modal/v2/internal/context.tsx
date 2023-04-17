import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ModalRoot {
  generateId(): number;

  // root element should be immoral during lifecycle.
  getRootElement(): HTMLDivElement;
  releaseRootElement(): void;
}

export const ModalRootContext = createContext<ModalRoot | null>(null);

export const ModalRootProvider: FunctionComponent = ({ children }) => {
  const [generateId] = useState(() => {
    let id = 0;
    return () => {
      return id++;
    };
  });

  const [rootElmFns] = useState(() => {
    let count = 0;

    let rootElement: HTMLDivElement | null = null;

    return {
      getRootElement: () => {
        count++;

        if (rootElement) {
          return rootElement;
        }

        const root = document.createElement("div");
        root.setAttribute("id", "modal-root");
        document.body.appendChild(root);

        root.style.position = "fixed";
        root.style.top = "0";
        root.style.bottom = "0";
        root.style.left = "0";
        root.style.right = "0";
        root.style.zIndex = "9999999";

        rootElement = root;
        return rootElement;
      },
      releaseRootElement: () => {
        if (count > 0) {
          count = count - 1;
          if (count === 0) {
            const root = document.body.querySelector("#modal-root");
            if (root) {
              document.body.removeChild(root);
            }

            rootElement = null;
          }
        }
      },
    };
  });

  // Clear root element when unmount
  useEffect(() => {
    return () => {
      const root = document.body.querySelector("#modal-root");
      if (root) {
        document.body.removeChild(root);
      }
    };
  }, []);

  return (
    <ModalRootContext.Provider
      value={useMemo(() => {
        return {
          generateId,
          getRootElement(): HTMLDivElement {
            return rootElmFns.getRootElement();
          },
          releaseRootElement(): void {
            return rootElmFns.releaseRootElement();
          },
        };
      }, [generateId, rootElmFns])}
    >
      {children}
    </ModalRootContext.Provider>
  );
};

export const useModalRoot = (
  _isOpen: boolean
): {
  readonly id: number;
} & ModalRoot => {
  const context = React.useContext(ModalRootContext);
  if (!context) {
    throw new Error("You have forgot to use ModalRootContext");
  }
  const [id] = useState(() => {
    return context.generateId();
  });

  return {
    id,
    ...context,
  };
};
