import PQueue from "p-queue";

interface MessageQueueCore<T = unknown> {
  enqueue(message: T): void;
  subscribe(handler: (msg: T) => Promise<void> | void): void;
  flush(): void;
}

class SingleChannelMessageQueueCore<T = unknown>
  implements MessageQueueCore<T>
{
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

  subscribe(handler: (msg: T) => Promise<void> | void) {
    this.subscriber = handler;
    this.flush();
  }

  flush() {
    if (this.isFlushing) return;
    if (!this.subscriber) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    try {
      while (this.buffer.length > 0) {
        const msg = this.buffer.shift()!;
        this.queue.add(async () => {
          try {
            await this.subscriber!(msg);
          } catch (e) {
            console.error("error:", e);
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
    this.core.subscribe(handler);
  }
}

export function createSingleChannelMessageQueue<T = unknown>(concurrency = 1) {
  const core = new SingleChannelMessageQueueCore<T>(concurrency);
  return {
    publisher: new Publisher<T>(core),
    subscriber: new Subscriber<T>(core),
  };
}

export interface TxExecutableEvent {
  readonly executionId: string;
  readonly executableChainIds: string[];
}
