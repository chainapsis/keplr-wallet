import React, {FunctionComponent, PropsWithChildren} from 'react';
export interface ImportFromExtension {
  scan: (data: string, navigation: any) => boolean;
  isLoading: boolean;
  cleanUp: () => void;
}
export declare const ImportFromExtensionContext: React.Context<ImportFromExtension | null>;
export declare const ImportFromExtensionProvider: FunctionComponent<PropsWithChildren>;
export declare const useImportFromExtension: () => ImportFromExtension;
