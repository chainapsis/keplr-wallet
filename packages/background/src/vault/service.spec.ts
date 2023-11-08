import { VaultService } from "./service";
import { KVStore, MemoryKVStore } from "@keplr-wallet/common";

describe("Test vault service", () => {
  // Add polyfill for `getRandomValues`
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.crypto = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0, l = arr.length; i < l; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };

  let kvStore: KVStore;
  let service: VaultService;

  beforeEach(async () => {
    kvStore = new MemoryKVStore("test");
    service = new VaultService(kvStore);

    await service.init();
  });

  const initAndEnsureSignUp = async (service: VaultService) => {
    expect(service.isSignedUp).toBe(false);
    expect(service.isLocked).toBe(true);

    await service.signUp("password");

    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(false);
  };

  const testUnlock = async (
    service: VaultService,
    password: string = "password"
  ) => {
    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(true);

    await expect(service.unlock("invalid-password")).rejects.toThrow();

    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(true);

    await service.unlock(password);

    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(false);
  };

  const testCheckPassword = async (service: VaultService) => {
    await service.checkUserPassword("password");

    service.lock();
    await expect(service.checkUserPassword("password")).rejects.toThrow();

    await service.unlock("password");

    await service.checkUserPassword("password");
  };

  it("test sign up", async () => {
    await initAndEnsureSignUp(service);
  });

  it("test lock/unlock", async () => {
    await initAndEnsureSignUp(service);

    service.lock();

    await testUnlock(service);

    service.lock();

    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(true);
  });

  it("test lock/unlock after restore", async () => {
    await initAndEnsureSignUp(service);

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored);

    restored.lock();

    expect(restored.isSignedUp).toBe(true);
    expect(restored.isLocked).toBe(true);
  });

  it("test lock/unlock after restore 2", async () => {
    await initAndEnsureSignUp(service);

    service.lock();

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored);

    restored.lock();

    expect(restored.isSignedUp).toBe(true);
    expect(restored.isLocked).toBe(true);
  });

  it("addVault should throw error if service is not signed up or locked", async () => {
    expect(() =>
      service.addVault(
        "test",
        { insensitive: "insensitive" },
        { sensitive: "sensitive" }
      )
    ).toThrow();

    await initAndEnsureSignUp(service);

    service.lock();

    expect(() =>
      service.addVault(
        "test",
        { insensitive: "insensitive" },
        { sensitive: "sensitive" }
      )
    ).toThrow();
  });

  it("test add/removeVault", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      { insensitive: "insensitive" },
      { sensitive: "sensitive" }
    );

    const vault = service.getVault("test", id);
    expect(vault).not.toBeUndefined();
    expect(vault?.id).toBe(id);
    expect(vault?.insensitive).toStrictEqual({ insensitive: "insensitive" });
    expect(service.decrypt(vault!.sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });

    const vaults = service.getVaults("test");
    expect(vaults.length).toBe(1);
    expect(vaults[0].id).toBe(vault?.id);

    expect(service.getVaults("not-exist")).toHaveLength(0);

    const id2 = service.addVault(
      "test",
      { insensitive: "insensitive2" },
      { sensitive: "sensitive2" }
    );
    const vault2 = service.getVault("test", id2);
    expect(vault2).not.toBeUndefined();
    expect(vault2?.id).toBe(id2);
    expect(vault2?.insensitive).toStrictEqual({ insensitive: "insensitive2" });
    expect(service.decrypt(vault2!.sensitive)).toStrictEqual({
      sensitive: "sensitive2",
    });

    const vaults2 = service.getVaults("test");
    expect(vaults2.length).toBe(2);
    expect(vaults2[0].id).toBe(id);
    expect(vaults2[1].id).toBe(id2);

    expect(() => service.removeVault("test", "not-exist")).toThrow();
    expect(() => service.removeVault("not-exist", id)).toThrow();

    service.removeVault("test", id);
    expect(service.getVault("test", id)).toBeUndefined();

    const vaults3 = service.getVaults("test");
    expect(vaults3.length).toBe(1);
    expect(vaults3[0].id).toBe(id2);

    service.removeVault("test", id2);
    expect(service.getVault("test", id2)).toBeUndefined();

    const vaults4 = service.getVaults("test");
    expect(vaults4.length).toBe(0);
  });

  it("test add/removeVault after restore", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      { insensitive: "insensitive" },
      { sensitive: "sensitive" }
    );

    const id2 = service.addVault(
      "test",
      { insensitive: "insensitive2" },
      { sensitive: "sensitive2" }
    );

    const id3 = service.addVault(
      "test",
      { insensitive: "insensitive3" },
      { sensitive: "sensitive3" }
    );

    service.removeVault("test", id3);

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored);

    const vaults = restored.getVaults("test");
    expect(vaults.length).toBe(2);
    expect(vaults[0].id).toBe(id);
    expect(vaults[0].insensitive).toStrictEqual({ insensitive: "insensitive" });
    expect(vaults[1].id).toBe(id2);
    expect(vaults[1].insensitive).toStrictEqual({
      insensitive: "insensitive2",
    });

    expect(restored.decrypt(vaults[0].sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });
    expect(restored.decrypt(vaults[1].sensitive)).toStrictEqual({
      sensitive: "sensitive2",
    });
  });

  it("test setAndMergeInsensitiveToVault", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      { insensitive: "insensitive" },
      { sensitive: "sensitive" }
    );

    const id2 = service.addVault(
      "test",
      { insensitive: "insensitive2" },
      { sensitive: "sensitive2" }
    );

    service.setAndMergeInsensitiveToVault("test", id, {
      insensitive: "insensitive2",
      newField: "newField",
    });

    const vault = service.getVault("test", id);
    expect(vault).not.toBeUndefined();
    expect(vault?.id).toBe(id);
    expect(vault?.insensitive).toStrictEqual({
      insensitive: "insensitive2",
      newField: "newField",
    });
    expect(service.decrypt(vault!.sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });

    const vault2 = service.getVault("test", id2);
    expect(vault2).not.toBeUndefined();
    expect(vault2?.id).toBe(id2);
    expect(vault2?.insensitive).toStrictEqual({
      insensitive: "insensitive2",
    });
    expect(service.decrypt(vault2!.sensitive)).toStrictEqual({
      sensitive: "sensitive2",
    });

    service.setAndMergeInsensitiveToVault("test", id2, {
      insensitive: "insensitive2-2",
      newField2: "newField2",
    });

    const vault3 = service.getVault("test", id2);
    expect(vault3).not.toBeUndefined();
    expect(vault3?.id).toBe(id2);
    expect(vault3?.insensitive).toStrictEqual({
      insensitive: "insensitive2-2",
      newField2: "newField2",
    });
    expect(service.decrypt(vault3!.sensitive)).toStrictEqual({
      sensitive: "sensitive2",
    });
  });

  it("test setAndMergeInsensitiveToVault after restore", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      { insensitive: "insensitive" },
      { sensitive: "sensitive" }
    );

    const id2 = service.addVault(
      "test",
      { insensitive: "insensitive2" },
      { sensitive: "sensitive2" }
    );

    service.setAndMergeInsensitiveToVault("test", id, {
      insensitive: "insensitive2",
      newField: "newField",
    });

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored);

    const vault = restored.getVault("test", id);
    expect(vault).not.toBeUndefined();
    expect(vault?.id).toBe(id);
    expect(vault?.insensitive).toStrictEqual({
      insensitive: "insensitive2",
      newField: "newField",
    });
    expect(restored.decrypt(vault!.sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });

    const vault2 = restored.getVault("test", id2);
    expect(vault2).not.toBeUndefined();
    expect(vault2?.id).toBe(id2);
    expect(vault2?.insensitive).toStrictEqual({ insensitive: "insensitive2" });
    expect(restored.decrypt(vault2!.sensitive)).toStrictEqual({
      sensitive: "sensitive2",
    });
  });

  it("test check user password", async () => {
    await initAndEnsureSignUp(service);

    await testCheckPassword(service);
  });

  it("test check user password after restore", async () => {
    await initAndEnsureSignUp(service);

    await testCheckPassword(service);

    const restored = new VaultService(kvStore);
    await restored.init();

    // Not yet unlocked
    await expect(restored.checkUserPassword("password")).rejects.toThrow();

    await testUnlock(restored);

    await testCheckPassword(restored);
  });

  it("test change user password", async () => {
    await initAndEnsureSignUp(service);

    await expect(
      service.changeUserPassword("invalid", "new-password")
    ).rejects.toThrow();

    const id = service.addVault(
      "test",
      {
        insensitive: "insensitive",
      },
      {
        sensitive: "sensitive",
      }
    );

    await service.changeUserPassword("password", "new-password");

    expect(service.isSignedUp).toBe(true);
    expect(service.isLocked).toBe(false);

    await expect(service.checkUserPassword("password")).rejects.toThrow();
    await service.checkUserPassword("new-password");

    const vault = service.getVault("test", id);
    expect(vault).not.toBeUndefined();
    expect(vault?.id).toBe(id);
    expect(vault?.insensitive).toStrictEqual({ insensitive: "insensitive" });
    expect(service.decrypt(vault!.sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });

    service.lock();

    await testUnlock(service, "new-password");
  });

  it("test change user password after restore", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      {
        insensitive: "insensitive",
      },
      {
        sensitive: "sensitive",
      }
    );

    await service.changeUserPassword("password", "new-password");

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored, "new-password");

    await expect(service.checkUserPassword("password")).rejects.toThrow();
    await service.checkUserPassword("new-password");

    const vault = service.getVault("test", id);
    expect(vault).not.toBeUndefined();
    expect(vault?.id).toBe(id);
    expect(vault?.insensitive).toStrictEqual({ insensitive: "insensitive" });
    expect(service.decrypt(vault!.sensitive)).toStrictEqual({
      sensitive: "sensitive",
    });
  });

  it("test re-sign up after clear all", async () => {
    await initAndEnsureSignUp(service);

    const id = service.addVault(
      "test",
      {
        insensitive: "insensitive",
      },
      {
        sensitive: "sensitive",
      }
    );

    await service.clearAll("password");

    expect(service.isSignedUp).toBe(false);
    expect(service.isLocked).toBe(true);

    await service.signUp("new-password");
    await expect(service.checkUserPassword("password")).rejects.toThrow();
    await service.checkUserPassword("new-password");

    const id2 = service.addVault(
      "test2",
      {
        insensitive: "insensitive",
      },
      {
        sensitive: "sensitive",
      }
    );

    expect(service.getVault("test", id)).toBeUndefined();
    await expect(service.getVault("test2", id2)?.insensitive).toStrictEqual({
      insensitive: "insensitive",
    });
    expect(
      service.decrypt(service.getVault("test2", id2)!.sensitive)
    ).toStrictEqual({
      sensitive: "sensitive",
    });

    const restored = new VaultService(kvStore);
    await restored.init();

    await testUnlock(restored, "new-password");

    await expect(restored.checkUserPassword("password")).rejects.toThrow();
    await restored.checkUserPassword("new-password");

    expect(restored.getVault("test", id)).toBeUndefined();
    await expect(restored.getVault("test2", id2)?.insensitive).toStrictEqual({
      insensitive: "insensitive",
    });
    expect(
      restored.decrypt(restored.getVault("test2", id2)!.sensitive)
    ).toStrictEqual({
      sensitive: "sensitive",
    });
  });
});
