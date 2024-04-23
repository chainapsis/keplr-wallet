import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ModalRoot {
  generateId(): number;

  // root element should be immoral during lifecycle.
  registerRootElement(): string;
  releaseRootElement(id: string): void;
  getRootElement(id: string): HTMLDivElement | null;
}

export const ModalRootContext = createContext<ModalRoot | null>(null);

export const ModalRootProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [generateId] = useState(() => {
    let id = 0;
    return () => {
      return id++;
    };
  });

  const [rootElmFns] = useState(() => {
    let seq = 0;

    const rootElementMap = new Map<string, HTMLDivElement>();

    return {
      registerRootElement: (): string => {
        seq = seq + 1;
        const id = seq.toString();

        const root = document.createElement("div");
        root.setAttribute("id", `modal-root-${id}`);
        document.body.appendChild(root);

        root.style.position = "fixed";
        root.style.top = "0";
        root.style.bottom = "0";
        root.style.left = "0";
        root.style.right = "0";
        root.style.zIndex = "9999999";
        root.style.pointerEvents = "none";

        rootElementMap.set(id, root);

        return id;
      },
      releaseRootElement: (id: string) => {
        if (rootElementMap.has(id)) {
          const element = document.body.querySelector(`#modal-root-${id}`);
          if (element) {
            document.body.removeChild(element);
          }

          rootElementMap.delete(id);
        }
      },
      getRootElement: (id: string): HTMLDivElement | null => {
        const root = rootElementMap.get(id);
        if (root) {
          return root;
        }
        return null;
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
          ...rootElmFns,
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
