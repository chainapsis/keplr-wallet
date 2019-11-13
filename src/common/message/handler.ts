import { Message } from "./message";

export type Handler = (msg: Message<unknown>) => any;
