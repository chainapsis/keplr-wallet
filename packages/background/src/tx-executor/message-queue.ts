import PQueue from "p-queue";

class MessageQueueCore<T = unknown> {
  public subscriber: ((msg: T) => Promise<void> | void) | null = null;
  public buffer: T[] = [];
  public queue: PQueue;
  private isFlushing = false;

  constructor(concurrency = 1) {
    this.queue = new PQueue({ concurrency });
  }

  enqueue(message: T) {
    this.buffer.push(message);
    this.flush();
  }

  /**
   * subscriber 설정
   */
  setSubscriber(handler: (msg: T) => Promise<void> | void) {
    this.subscriber = handler;
    this.flush();
  }

  private flush() {
    if (this.isFlushing) return;
    if (!this.subscriber) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    try {
      console.log("[MessageQueueCore] flush start", this.buffer.length);

      while (this.buffer.length > 0) {
        const msg = this.buffer.shift()!;
        this.queue.add(async () => {
          try {
            await this.subscriber!(msg);
          } catch (e) {
            console.error("[MessageQueueCore] handler error:", e);
          }
        });
      }
    } finally {
      this.isFlushing = false;
    }
  }
}
export class Publisher<T = unknown> {
  constructor(private core: MessageQueueCore<T>) {}

  publish(message: T) {
    this.core.enqueue(message);
  }
}

export class Subscriber<T = unknown> {
  constructor(private core: MessageQueueCore<T>) {}

  subscribe(handler: (msg: T) => Promise<void> | void) {
    this.core.setSubscriber(handler);
  }
}

export function createMessageQueue<T = unknown>(concurrency = 1) {
  const core = new MessageQueueCore<T>(concurrency);
  return {
    publisher: new Publisher<T>(core),
    subscriber: new Subscriber<T>(core),
  };
}

export interface TxExecutableEvent {
  readonly executionId: string;
  readonly executableChainIds: string[];
}
