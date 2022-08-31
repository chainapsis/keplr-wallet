import "fastestsmallesttextencoderdecoder";
import "react-native-url-polyfill/auto";

global.BigInt = global.BigInt ?? require("big-integer");
// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer ?? require("buffer/").Buffer;

// This has to be before crypto
global.process = global.process ?? require("process");
// @ts-expect-error
global.process["version"] = "16.15.0";

// noinspection JSConstantReassignment
global.crypto = global.crypto ?? require("react-native-crypto");
