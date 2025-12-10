import PQueue from "p-queue";

export interface EventBusCore<T = unknown> {
  enqueue(message: T): void;
  subscribe(handler: (msg: T) => Promise<void> | void): void;
  flush(): void;
}

class SingleChannelEventBusCore<T = unknown> implements EventBusCore<T> {
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
    const subscriber = this.subscriber;
    if (!subscriber) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    try {
      while (this.buffer.length > 0) {
        const msg = this.buffer.shift();
        if (msg === undefined) {
          return;
        }
        this.queue.add(async () => {
          try {
            await subscriber(msg);
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

export class EventBusPublisher<T = unknown> {
  constructor(private core: EventBusCore<T>) {}

  publish(message: T) {
    this.core.enqueue(message);
  }
}

export class EventBusSubscriber<T = unknown> {
  constructor(private core: EventBusCore<T>) {}

  subscribe(handler: (msg: T) => Promise<void> | void) {
    this.core.subscribe(handler);
  }
}

export function createSingleChannelEventBus<T = unknown>(concurrency = 1) {
  const core = new SingleChannelEventBusCore<T>(concurrency);
  return {
    publisher: new EventBusPublisher<T>(core),
    subscriber: new EventBusSubscriber<T>(core),
  };
}
