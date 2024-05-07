"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImportFromExtension = exports.ImportFromExtensionProvider = exports.ImportFromExtensionContext = void 0;
const react_1 = __importStar(require("react"));
exports.ImportFromExtensionContext = (0, react_1.createContext)(null);
const ImportFromExtensionProvider = ({ children }) => {
    return (react_1.default.createElement(exports.ImportFromExtensionContext.Provider, { value: (0, react_1.useMemo)(() => {
            return {
                scan: (_data) => {
                    return false;
                },
                isLoading: false,
                cleanUp: () => { },
            };
        }, []) }, children));
};
exports.ImportFromExtensionProvider = ImportFromExtensionProvider;
const useImportFromExtension = () => {
    const importFromExtension = react_1.default.useContext(exports.ImportFromExtensionContext);
    if (!importFromExtension) {
        throw new Error('ImportFromExtension is not provided from the parent component.');
    }
    return importFromExtension;
};
exports.useImportFromExtension = useImportFromExtension;
//# sourceMappingURL=import-from-extension.js.map