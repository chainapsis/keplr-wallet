import { KeyRingStatus } from "../keyring";
import { AutoLockAccountService } from "./service";
import { MemoryKVStore } from "@keplr-wallet/common";
import EventEmitter from "events";

class MockKeyRingService {
  public keyRingStatus: KeyRingStatus = KeyRingStatus.NOTLOADED;
  public isLocked = true;

  unlock() {
    this.isLocked = false;
    this.keyRingStatus = KeyRingStatus.UNLOCKED;
  }

  lock() {
    this.isLocked = true;
    this.keyRingStatus = KeyRingStatus.LOCKED;
  }
}

describe("Test auto lock account service", () => {
  it("test init", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
    } as any;

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(new MemoryKVStore("test"));
    await service.init(keyRingService);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();
  });

  it("test restore", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
    } as any;

    const keyRingService = new MockKeyRingService();
    const memStore = new MemoryKVStore("test");
    let service = new AutoLockAccountService(memStore);
    await service.init(keyRingService);

    // Set duration.
    await service.setDuration(1000);
    expect(service.getAutoLockDuration()).toBe(1000);

    service = new AutoLockAccountService(memStore);
    await service.init(keyRingService);

    expect(service.getAutoLockDuration()).toBe(1000);

    jest.restoreAllMocks();
  });

  it("test device sleep", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
    } as any;

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(new MemoryKVStore("test"));
    await service.init(keyRingService);

    keyRingService.unlock();
    event.emit("onStateChanged", "locked");

    expect(keyRingService.isLocked).toBe(false);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();
  });

  it("test device sleep 2", async () => {
    const event = new EventEmitter();

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
    } as any;

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(new MemoryKVStore("test"));
    await service.init(keyRingService);

    await service.setDuration(1000);

    keyRingService.lock();
    event.emit("onStateChanged", "locked");

    expect(keyRingService.isLocked).toBe(true);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();
  });
});
