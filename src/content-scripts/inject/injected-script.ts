import { sendMessage } from "../../common/message";
import { SetPersistentMemoryMsg } from "../../background/persistent-memory";
import { BACKGROUND_PORT } from "../../common/message/constant";

console.log("injected script executed");
(window as any).Test = "Test!!";

const msg = SetPersistentMemoryMsg.create({ test: "test" });
sendMessage(BACKGROUND_PORT, msg);
