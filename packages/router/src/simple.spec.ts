import { SimpleMessage } from "./simple";
import { JSONUint8Array } from "./uint8-array";

describe("Test simple message", () => {
  it("test simple message", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      test: 1,
      test2: "test",
    });

    expect(simpleMessage.route()).toBe("route-test");
    expect(simpleMessage.type()).toBe("type-test");
    expect(simpleMessage.approveExternal()).toBe(true);
    expect(() => {
      simpleMessage.validateBasic();
    }).not.toThrow();
  });

  it("encoded simple message should have only datas", () => {
    const simpleMessage = new SimpleMessage("route-test", "type-test", {
      test: 1,
      test2: "test",
    });

    const encoded = JSONUint8Array.stringify(simpleMessage);
    const decoded = JSONUint8Array.parse(encoded);

    expect(decoded["route"]).toBe(undefined);
    expect(decoded["type"]).toBe(undefined);
    expect(decoded["test"]).toBe(1);
    expect(decoded["test2"]).toBe("test");
    expect(Object.keys(decoded).length).toBe(2);
  });
});
