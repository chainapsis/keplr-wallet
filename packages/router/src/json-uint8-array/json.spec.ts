import assert from "assert";

import { Buffer } from "buffer/";
import { JSONUint8Array } from "./index";

describe("Test json with Uint8Array", () => {
  it("should stringify properly with uint8array", () => {
    const test = {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: Buffer.from([1, 2, 3]),
      e: undefined,
      f: null,
    };

    const text = JSONUint8Array.stringify(test);

    assert.strictEqual(
      text,
      '{"a":1,"b":"test","c":"__uint8array__010203","d":"__uint8array__010203","f":null}'
    );
  });

  it("should parse properly with the prefixed string with __uint8array__", () => {
    const text =
      '{"a":1,"b":"test","c":"__uint8array__010203","d":"__uint8array__010203","f":null}';

    const obj = JSONUint8Array.parse(text);
    assert.deepStrictEqual(obj, {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: new Uint8Array([1, 2, 3]),
      f: null,
    });
  });

  it("should stringify properly with uint8array for nested obj", () => {
    const test = {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: {
        a: new Uint8Array([1, 2, 3]),
        b: Buffer.from([1, 2, 3]),
        c: [new Uint8Array([1, 2, 3]), Buffer.from([1, 2, 3])],
        d: [new Uint8Array([1, 2, 3]), null, undefined],
      },
    };

    const text = JSONUint8Array.stringify(test);

    assert.strictEqual(
      text,
      '{"a":1,"b":"test","c":"__uint8array__010203","d":{"a":"__uint8array__010203","b":"__uint8array__010203","c":["__uint8array__010203","__uint8array__010203"],"d":["__uint8array__010203",null,null]}}'
    );
  });

  it("should parse properly with uint8array for nested text", () => {
    const text =
      '{"a":1,"b":"test","c":"__uint8array__010203","d":{"a":"__uint8array__010203","b":"__uint8array__010203","c":["__uint8array__010203","__uint8array__010203"],"d":["__uint8array__010203",null,null]}}';

    const obj = JSONUint8Array.parse(text);
    assert.deepStrictEqual(obj, {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: {
        a: new Uint8Array([1, 2, 3]),
        b: new Uint8Array([1, 2, 3]),
        c: [new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])],
        d: [new Uint8Array([1, 2, 3]), null, null],
      },
    });
  });

  it("should wrap/unwrap properly with uint8array for nested obj", () => {
    const test = {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: {
        a: new Uint8Array([1, 2, 3]),
        b: Buffer.from([1, 2, 3]),
        c: [new Uint8Array([1, 2, 3]), Buffer.from([1, 2, 3])],
        d: [new Uint8Array([1, 2, 3]), null, undefined],
      },
    };

    const wraped = JSONUint8Array.wrap(test);
    assert.deepStrictEqual(wraped, {
      a: 1,
      b: "test",
      c: "__uint8array__010203",
      d: {
        a: "__uint8array__010203",
        b: "__uint8array__010203",
        c: ["__uint8array__010203", "__uint8array__010203"],
        d: ["__uint8array__010203", null, null],
      },
    });

    const unwraped = JSONUint8Array.unwrap(wraped);
    assert.deepStrictEqual(unwraped, {
      a: 1,
      b: "test",
      c: new Uint8Array([1, 2, 3]),
      d: {
        a: new Uint8Array([1, 2, 3]),
        b: new Uint8Array([1, 2, 3]),
        c: [new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])],
        d: [new Uint8Array([1, 2, 3]), null, null],
      },
    });
  });
});
