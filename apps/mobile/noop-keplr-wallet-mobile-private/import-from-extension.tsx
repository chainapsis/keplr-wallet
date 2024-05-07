import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useMemo,
} from 'react';

export interface ImportFromExtension {
  scan: (data: string, navigation: any) => boolean;
  isLoading: boolean;
  cleanUp: () => void;
}

export const ImportFromExtensionContext =
  createContext<ImportFromExtension | null>(null);

export const ImportFromExtensionProvider: FunctionComponent<
  PropsWithChildren
> = ({children}) => {
  return (
    <ImportFromExtensionContext.Provider
      value={useMemo(() => {
        return {
          scan: (_data: string) => {
            return false;
          },
          isLoading: false,
          cleanUp: () => {},
        };
      }, [])}>
      {children}
    </ImportFromExtensionContext.Provider>
  );
};

export const useImportFromExtension = (): ImportFromExtension => {
  const importFromExtension = React.useContext(ImportFromExtensionContext);
  if (!importFromExtension) {
    throw new Error(
      'ImportFromExtension is not provided from the parent component.',
    );
  }
  return importFromExtension;
};
