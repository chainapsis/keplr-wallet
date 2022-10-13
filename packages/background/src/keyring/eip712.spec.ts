import {
  EIP712DomainTypeValidator,
  EIP712MessageValidator,
  EIP712PropertyFieldValidator,
} from "./eip712";
import assert from "assert";

describe("Test EIP712 types", () => {
  it("test property field", async () => {
    const property = {
      name: "test",
      type: "ee",
    };

    await EIP712PropertyFieldValidator.validateAsync(property);

    await assert.rejects(() =>
      EIP712PropertyFieldValidator.validateAsync({
        ...property,
        test: "unknown field",
      })
    );
  });

  it("test EIP712 domain type", async () => {
    const properties = [
      {
        name: "name",
        type: "string",
      },
      {
        name: "verifyingContract",
        type: "address",
      },
    ];

    await EIP712DomainTypeValidator.validateAsync(properties);

    // Should not empty
    await assert.rejects(() => EIP712PropertyFieldValidator.validateAsync([]));

    await assert.rejects(() =>
      EIP712PropertyFieldValidator.validateAsync(
        properties.map((p) => {
          return {
            ...p,
            test: "unknown field",
          };
        })
      )
    );

    // Should not be duplicated
    await assert.rejects(() =>
      EIP712PropertyFieldValidator.validateAsync(
        properties.concat(properties[0])
      )
    );

    let validatedDomainType = await EIP712DomainTypeValidator.validateAsync(
      properties.concat({
        name: "salt",
        // string should be permitted even though it is ambiguous to match standard (because ethermint requires this).
        type: "string",
      })
    );
    expect(validatedDomainType[validatedDomainType.length - 1].name).toBe(
      "salt"
    );
    expect(validatedDomainType[validatedDomainType.length - 1].type).toBe(
      "string"
    );

    // Domain types should be sorted
    validatedDomainType = await EIP712DomainTypeValidator.validateAsync([
      {
        name: "verifyingContract",
        type: "address",
      },
      {
        name: "name",
        type: "string",
      },
      {
        name: "version",
        type: "string",
      },
    ]);
    expect(validatedDomainType[0].name).toBe("name");
    expect(validatedDomainType[0].type).toBe("string");
    expect(validatedDomainType[1].name).toBe("version");
    expect(validatedDomainType[1].type).toBe("string");
    expect(validatedDomainType[2].name).toBe("verifyingContract");
    expect(validatedDomainType[2].type).toBe("address");
  });

  it("test EIP712 message", async () => {
    await EIP712MessageValidator.validateAsync({
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "verifyingContract",
            type: "address",
          },
        ],
        Tx: [
          {
            name: "msg",
            type: "Msg",
          },
        ],
        Msg: [
          {
            name: "text",
            type: "string",
          },
        ],
      },
      primaryType: "Tx",
      domain: {
        name: "test domain",
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      message: {
        msg: {
          text: "test",
        },
      },
    });

    await assert.rejects(() => EIP712MessageValidator.validateAsync({}));

    // Domain types should be sorted
    const validatedEIP712Message = await EIP712MessageValidator.validateAsync({
      types: {
        EIP712Domain: [
          {
            name: "verifyingContract",
            type: "address",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "version",
            type: "string",
          },
        ],
        Tx: [
          {
            name: "msg",
            type: "Msg",
          },
        ],
        Msg: [
          {
            name: "text",
            type: "string",
          },
        ],
      },
      primaryType: "Tx",
      domain: {
        name: "test domain",
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      message: {
        msg: {
          text: "test",
        },
      },
    });
    expect(validatedEIP712Message.types.EIP712Domain[0].name).toBe("name");
    expect(validatedEIP712Message.types.EIP712Domain[0].type).toBe("string");
    expect(validatedEIP712Message.types.EIP712Domain[1].name).toBe("version");
    expect(validatedEIP712Message.types.EIP712Domain[1].type).toBe("string");
    expect(validatedEIP712Message.types.EIP712Domain[2].name).toBe(
      "verifyingContract"
    );
    expect(validatedEIP712Message.types.EIP712Domain[2].type).toBe("address");

    // TODO: More cases...
  });
});
