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

  it("test checkAppIsActive", async () => {
    const event = new EventEmitter();

    let background: string | undefined;
    let views: string[] = [];

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    const mockGetBackgroundPage = jest.fn().mockImplementation(() => {
      if (!background) {
        return;
      }

      return {
        location: {
          href: background,
        },
      };
    });
    const mockGetViews = jest.fn().mockImplementation(() => {
      return views.map((view) => ({
        location: {
          href: view,
        },
      }));
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
      extension: {
        getBackgroundPage: mockGetBackgroundPage,
        getViews: mockGetViews,
      },
    } as any;

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(new MemoryKVStore("test"));
    await service.init(keyRingService);

    expect(service.checkAppIsActive()).toBe(false);

    // Cases that don't actually happen
    background = undefined;
    views = ["test"];
    expect(service.checkAppIsActive()).toBe(true);

    // Cases that don't actually happen
    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = [];
    expect(service.checkAppIsActive()).toBe(false);

    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = [background];
    expect(service.checkAppIsActive()).toBe(false);

    // Cases that don't actually happen
    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = ["chrome-extension://hajcclbibbmagnhankhjinooiploogfm/popup.html"];
    expect(service.checkAppIsActive()).toBe(true);

    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = [
      background,
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/popup.html",
    ];
    expect(service.checkAppIsActive()).toBe(true);

    expect(mockListener).toBeCalledTimes(1);
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

  it("test startAppStateCheckTimer do nothing when keyring is locked", async () => {
    const event = new EventEmitter();

    const setTimeoutSpy = jest.spyOn(global, "setTimeout");

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

    expect(service.keyRingIsUnlocked).toBe(false);

    service.startAppStateCheckTimer();

    // Expect setTimeout not called.
    expect(setTimeoutSpy).toBeCalledTimes(0);
    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();
  });

  it("test startAppStateCheckTimer", async () => {
    const event = new EventEmitter();

    let background: string | undefined;
    let views: string[] = [];

    const mockListener = jest.fn().mockImplementation((fn) => {
      event.addListener("onStateChanged", fn);
    });
    const mockGetBackgroundPage = jest.fn().mockImplementation(() => {
      if (!background) {
        return;
      }

      return {
        location: {
          href: background,
        },
      };
    });
    const mockGetViews = jest.fn().mockImplementation(() => {
      return views.map((view) => ({
        location: {
          href: view,
        },
      }));
    });
    global.browser = {
      idle: {
        onStateChanged: {
          addListener: mockListener,
        },
      },
      extension: {
        getBackgroundPage: mockGetBackgroundPage,
        getViews: mockGetViews,
      },
    } as any;

    jest.useFakeTimers();

    const keyRingService = new MockKeyRingService();
    const service = new AutoLockAccountService(new MemoryKVStore("test"), {
      monitoringInterval: 500,
    });
    await service.init(keyRingService);

    await service.setDuration(1000);

    keyRingService.unlock();

    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = [
      background,
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/popup.html",
    ];
    expect(service.checkAppIsActive()).toBe(true);
    expect(service.keyRingIsUnlocked).toBe(true);

    service.startAppStateCheckTimer();

    for (let i = 0; i < 3; i++) {
      jest.advanceTimersByTime(500);
      expect(service.checkAppIsActive()).toBe(true);
      expect(keyRingService.isLocked).toBe(false);
      expect(service.keyRingIsUnlocked).toBe(true);
    }

    // Now, only background exists, thus keyring should be locked soon after duration + monitoring interval.
    background =
      "chrome-extension://hajcclbibbmagnhankhjinooiploogfm/_generated_background_page.html";
    views = [background];

    expect(service.checkAppIsActive()).toBe(false);
    expect(keyRingService.isLocked).toBe(false);
    expect(service.keyRingIsUnlocked).toBe(true);

    jest.advanceTimersByTime(500);

    expect(service.checkAppIsActive()).toBe(false);
    expect(keyRingService.isLocked).toBe(false);
    expect(service.keyRingIsUnlocked).toBe(true);

    jest.advanceTimersByTime(1000);

    expect(service.checkAppIsActive()).toBe(false);
    expect(keyRingService.isLocked).toBe(true);
    expect(service.keyRingIsUnlocked).toBe(false);

    expect(mockListener).toBeCalledTimes(1);
    jest.restoreAllMocks();

    jest.useRealTimers();
  });
});
