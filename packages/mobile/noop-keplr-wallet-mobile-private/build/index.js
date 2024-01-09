"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppleSignInPrivateKey = exports.getGoogleSignInPrivateKey = exports.isAppleSignInEnabled = exports.isGoogleSignInEnabled = void 0;
exports.isGoogleSignInEnabled = false;
exports.isAppleSignInEnabled = false;
const getGoogleSignInPrivateKey = () => __awaiter(void 0, void 0, void 0, function* () {
    throw new Error('Google sign in is not enabled');
});
exports.getGoogleSignInPrivateKey = getGoogleSignInPrivateKey;
const getAppleSignInPrivateKey = () => __awaiter(void 0, void 0, void 0, function* () {
    throw new Error('Apple sign in is not enabled');
});
exports.getAppleSignInPrivateKey = getAppleSignInPrivateKey;
//# sourceMappingURL=index.js.map