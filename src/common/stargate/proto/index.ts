import Long from "long";
import protobuf from "protobufjs/minimal";

// Ensure the protobuf module has a Long implementation, which otherwise only works
// in Node.js (see https://github.com/protobufjs/protobuf.js/issues/921#issuecomment-334925145)
protobuf.util.Long = Long;
protobuf.configure();

export * from "./generated/codecimpl";
