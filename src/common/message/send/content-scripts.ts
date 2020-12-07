import { Message } from "../message";

async function _sendMessage(
  port: string,
  msg: Message<unknown>,
  opts: { msgType?: string } = {}
): Promise<any> {
  // Set message's origin.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  msg["origin"] = window.location.origin;

  const tabs = await browser.tabs.query({
    discarded: false,
    status: "complete"
  });

  for (let i = 0; i < tabs.length; i++) {
    const tabId = tabs[i].id;
    if (tabId) {
      try {
        await browser.tabs.sendMessage(tabId, {
          port,
          type: opts.msgType || msg.type(),
          msg
        });
        // Ignore the failure
      } catch {}
    }
  }
}

/**
 * Send message to other process and receive result.
 * This checks if the process that sends message is extension process.
 * And if it is not, it executes not sending but posting automatically.
 * @param port Port that this sends to
 * @param msg Message to send
 */
export async function sendMessageToContentScripts<M extends Message<unknown>>(
  port: string,
  msg: M
): Promise<void> {
  msg.validateBasic();
  await _sendMessage(port, msg);
}
