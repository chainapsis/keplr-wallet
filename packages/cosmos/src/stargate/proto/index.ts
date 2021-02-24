import Long from "long";
import protobuf from "protobufjs/minimal";

protobuf.util.Long = Long;
protobuf.configure();

export * from "./generated/codecimpl";
