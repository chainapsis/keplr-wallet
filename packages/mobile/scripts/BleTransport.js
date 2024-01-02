"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null"
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(
      s ? "Object is not iterable." : "Symbol.iterator is not defined."
    );
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
exports.setReconnectionConfig = void 0;
/* eslint-disable prefer-template */
var hw_transport_1 = __importDefault(require("@ledgerhq/hw-transport"));
var react_native_ble_plx_1 = require("react-native-ble-plx");
var devices_1 = require("@ledgerhq/devices");
var sendAPDU_1 = require("@ledgerhq/devices/lib/ble/sendAPDU");
var receiveAPDU_1 = require("@ledgerhq/devices/lib/ble/receiveAPDU");
var logs_1 = require("@ledgerhq/logs");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var errors_1 = require("@ledgerhq/errors");
var monitorCharacteristic_1 = require("./monitorCharacteristic");
var awaitsBleOn_1 = require("./awaitsBleOn");
var remapErrors_1 = require("./remapErrors");
var connectOptions = {
  requestMTU: 156,
  connectionPriority: 1,
};
var transportsCache = {};
var bleManager = new react_native_ble_plx_1.BleManager();
var retrieveInfos = function (device) {
  if (!device || !device.serviceUUIDs) return;
  var _a = __read(device.serviceUUIDs, 1),
    serviceUUID = _a[0];
  if (!serviceUUID) return;
  var infos = (0, devices_1.getInfosForServiceUuid)(serviceUUID);
  if (!infos) return;
  return infos;
};
var reconnectionConfig = {
  pairingThreshold: 1000,
  delayAfterFirstPairing: 4000,
};
function setReconnectionConfig(config) {
  reconnectionConfig = config;
}
exports.setReconnectionConfig = setReconnectionConfig;
var delay = function (ms) {
  return new Promise(function (success) {
    return setTimeout(success, ms);
  });
};
function open(deviceOrId, needsReconnect) {
  return __awaiter(this, void 0, void 0, function () {
    var device,
      devices,
      connectedDevices,
      connectedDevicesFiltered,
      e_1,
      e_2,
      res,
      characteristics,
      _a,
      _b,
      uuid,
      e_3,
      e_4_1,
      deviceModel,
      serviceUuid,
      writeUuid,
      writeCmdUuid,
      notifyUuid,
      writeC,
      writeCmdC,
      notifyC,
      characteristics_1,
      characteristics_1_1,
      c,
      notifyObservable,
      notif,
      transport,
      onDisconnect,
      disconnectedSub,
      beforeMTUTime,
      afterMTUTime;
    var _c, _d, e_4, _e, e_5, _f;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          if (!(typeof deviceOrId === "string")) return [3 /*break*/, 13];
          if (transportsCache[deviceOrId]) {
            (0, logs_1.log)("ble-verbose", "Transport in cache, using that.");
            return [2 /*return*/, transportsCache[deviceOrId]];
          }
          (0, logs_1.log)("ble-verbose", "open(".concat(deviceOrId, ")"));
          return [4 /*yield*/, (0, awaitsBleOn_1.awaitsBleOn)(bleManager)];
        case 1:
          _g.sent();
          if (!!device) return [3 /*break*/, 3];
          return [4 /*yield*/, bleManager.devices([deviceOrId])];
        case 2:
          devices = _g.sent();
          (0,
          logs_1.log)("ble-verbose", "found ".concat(devices.length, " devices"));
          (_c = __read(devices, 1)), (device = _c[0]);
          _g.label = 3;
        case 3:
          if (!!device) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            bleManager.connectedDevices(
              (0, devices_1.getBluetoothServiceUuids)()
            ),
          ];
        case 4:
          connectedDevices = _g.sent();
          connectedDevicesFiltered = connectedDevices.filter(function (d) {
            return d.id === deviceOrId;
          });
          (0,
          logs_1.log)("ble-verbose", "found ".concat(connectedDevicesFiltered.length, " connected devices"));
          (_d = __read(connectedDevicesFiltered, 1)), (device = _d[0]);
          _g.label = 5;
        case 5:
          if (!!device) return [3 /*break*/, 12];
          (0,
          logs_1.log)("ble-verbose", "connectToDevice(".concat(deviceOrId, ")"));
          _g.label = 6;
        case 6:
          _g.trys.push([6, 8, , 12]);
          return [
            4 /*yield*/,
            bleManager.connectToDevice(deviceOrId, connectOptions),
          ];
        case 7:
          device = _g.sent();
          return [3 /*break*/, 12];
        case 8:
          e_1 = _g.sent();
          if (
            !(
              e_1.errorCode ===
              react_native_ble_plx_1.BleErrorCode.DeviceMTUChangeFailed
            )
          )
            return [3 /*break*/, 10];
          // eslint-disable-next-line require-atomic-updates
          connectOptions = {};
          return [4 /*yield*/, bleManager.connectToDevice(deviceOrId)];
        case 9:
          device = _g.sent();
          return [3 /*break*/, 11];
        case 10:
          throw e_1;
        case 11:
          return [3 /*break*/, 12];
        case 12:
          if (!device) {
            throw new errors_1.CantOpenDevice();
          }
          return [3 /*break*/, 14];
        case 13:
          device = deviceOrId;
          _g.label = 14;
        case 14:
          return [4 /*yield*/, device.isConnected()];
        case 15:
          if (!!_g.sent()) return [3 /*break*/, 22];
          (0, logs_1.log)("ble-verbose", "not connected. connecting...");
          _g.label = 16;
        case 16:
          _g.trys.push([16, 18, , 22]);
          return [4 /*yield*/, device.connect(connectOptions)];
        case 17:
          _g.sent();
          return [3 /*break*/, 22];
        case 18:
          e_2 = _g.sent();
          if (
            !(
              e_2.errorCode ===
              react_native_ble_plx_1.BleErrorCode.DeviceMTUChangeFailed
            )
          )
            return [3 /*break*/, 20];
          // eslint-disable-next-line require-atomic-updates
          connectOptions = {};
          return [4 /*yield*/, device.connect()];
        case 19:
          _g.sent();
          return [3 /*break*/, 21];
        case 20:
          throw e_2;
        case 21:
          return [3 /*break*/, 22];
        case 22:
          return [4 /*yield*/, device.discoverAllServicesAndCharacteristics()];
        case 23:
          _g.sent();
          res = retrieveInfos(device);
          if (!!res) return [3 /*break*/, 33];
          _g.label = 24;
        case 24:
          _g.trys.push([24, 31, 32, 33]);
          (_a = __values((0, devices_1.getBluetoothServiceUuids)())),
            (_b = _a.next());
          _g.label = 25;
        case 25:
          if (!!_b.done) return [3 /*break*/, 30];
          uuid = _b.value;
          _g.label = 26;
        case 26:
          _g.trys.push([26, 28, , 29]);
          return [4 /*yield*/, device.characteristicsForService(uuid)];
        case 27:
          characteristics = _g.sent();
          res = (0, devices_1.getInfosForServiceUuid)(uuid);
          return [3 /*break*/, 30];
        case 28:
          e_3 = _g.sent();
          return [3 /*break*/, 29];
        case 29:
          _b = _a.next();
          return [3 /*break*/, 25];
        case 30:
          return [3 /*break*/, 33];
        case 31:
          e_4_1 = _g.sent();
          e_4 = { error: e_4_1 };
          return [3 /*break*/, 33];
        case 32:
          try {
            if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
          } finally {
            if (e_4) throw e_4.error;
          }
          return [7 /*endfinally*/];
        case 33:
          if (!res) {
            throw new errors_1.TransportError(
              "service not found",
              "BLEServiceNotFound"
            );
          }
          (deviceModel = res.deviceModel),
            (serviceUuid = res.serviceUuid),
            (writeUuid = res.writeUuid),
            (writeCmdUuid = res.writeCmdUuid),
            (notifyUuid = res.notifyUuid);
          if (!!characteristics) return [3 /*break*/, 35];
          return [4 /*yield*/, device.characteristicsForService(serviceUuid)];
        case 34:
          characteristics = _g.sent();
          _g.label = 35;
        case 35:
          if (!characteristics) {
            throw new errors_1.TransportError(
              "service not found",
              "BLEServiceNotFound"
            );
          }
          try {
            for (
              characteristics_1 = __values(characteristics),
                characteristics_1_1 = characteristics_1.next();
              !characteristics_1_1.done;
              characteristics_1_1 = characteristics_1.next()
            ) {
              c = characteristics_1_1.value;
              if (c.uuid === writeUuid) {
                writeC = c;
              } else if (c.uuid === writeCmdUuid) {
                writeCmdC = c;
              } else if (c.uuid === notifyUuid) {
                notifyC = c;
              }
            }
          } catch (e_5_1) {
            e_5 = { error: e_5_1 };
          } finally {
            try {
              if (
                characteristics_1_1 &&
                !characteristics_1_1.done &&
                (_f = characteristics_1["return"])
              )
                _f.call(characteristics_1);
            } finally {
              if (e_5) throw e_5.error;
            }
          }
          if (!writeC) {
            throw new errors_1.TransportError(
              "write characteristic not found",
              "BLEChracteristicNotFound"
            );
          }
          if (!notifyC) {
            throw new errors_1.TransportError(
              "notify characteristic not found",
              "BLEChracteristicNotFound"
            );
          }
          if (!writeC.isWritableWithResponse) {
            throw new errors_1.TransportError(
              "write characteristic not writableWithResponse",
              "BLEChracteristicInvalid"
            );
          }
          if (!notifyC.isNotifiable) {
            throw new errors_1.TransportError(
              "notify characteristic not notifiable",
              "BLEChracteristicInvalid"
            );
          }
          if (writeCmdC) {
            if (!writeCmdC.isWritableWithoutResponse) {
              throw new errors_1.TransportError(
                "write cmd characteristic not writableWithoutResponse",
                "BLEChracteristicInvalid"
              );
            }
          }
          (0, logs_1.log)("ble-verbose", "device.mtu=".concat(device.mtu));
          notifyObservable = (0, monitorCharacteristic_1.monitorCharacteristic)(
            notifyC
          ).pipe(
            (0, operators_1.tap)(function (value) {
              (0, logs_1.log)("ble-frame", "<= " + value.toString("hex"));
            }),
            (0, operators_1.share)()
          );
          notif = notifyObservable.subscribe();
          transport = new BluetoothTransport(
            device,
            writeC,
            writeCmdC,
            notifyObservable,
            deviceModel
          );
          onDisconnect = function (e) {
            transport.notYetDisconnected = false;
            notif.unsubscribe();
            disconnectedSub.remove();
            delete transportsCache[transport.id];
            (0, logs_1.log)(
              "ble-verbose",
              "BleTransport(".concat(transport.id, ") disconnected")
            );
            transport.emit("disconnect", e);
          };
          // eslint-disable-next-line require-atomic-updates
          transportsCache[transport.id] = transport;
          disconnectedSub = device.onDisconnected(function (e) {
            if (!transport.notYetDisconnected) return;
            onDisconnect(e);
          });
          beforeMTUTime = Date.now();
          _g.label = 36;
        case 36:
          _g.trys.push([36, , 38, 44]);
          return [4 /*yield*/, transport.inferMTU()];
        case 37:
          _g.sent();
          return [3 /*break*/, 44];
        case 38:
          afterMTUTime = Date.now();
          if (!reconnectionConfig) return [3 /*break*/, 42];
          // workaround for #279: we need to open() again if we come the first time here,
          // to make sure we do a disconnect() after the first pairing time
          // because of a firmware bug
          if (
            afterMTUTime - beforeMTUTime <
            reconnectionConfig.pairingThreshold
          ) {
            needsReconnect = false; // (optim) there is likely no new pairing done because mtu answer was fast.
          }
          if (!needsReconnect) return [3 /*break*/, 41];
          // necessary time for the bonding workaround
          return [
            4 /*yield*/,
            BluetoothTransport.disconnect(transport.id)[
              "catch"
            ](function () {}),
          ];
        case 39:
          // necessary time for the bonding workaround
          _g.sent();
          return [
            4 /*yield*/,
            delay(reconnectionConfig.delayAfterFirstPairing),
          ];
        case 40:
          _g.sent();
          _g.label = 41;
        case 41:
          return [3 /*break*/, 43];
        case 42:
          needsReconnect = false;
          _g.label = 43;
        case 43:
          return [7 /*endfinally*/];
        case 44:
          if (needsReconnect) {
            return [2 /*return*/, open(device, false)];
          }
          return [2 /*return*/, transport];
      }
    });
  });
}
/**
 * react-native bluetooth BLE implementation
 * @example
 * import BluetoothTransport from "@ledgerhq/react-native-hw-transport-ble";
 */
var BluetoothTransport = /** @class */ (function (_super) {
  __extends(BluetoothTransport, _super);
  function BluetoothTransport(
    device,
    writeCharacteristic,
    writeCmdCharacteristic,
    notifyObservable,
    deviceModel
  ) {
    var _this = _super.call(this) || this;
    _this.mtuSize = 20;
    _this.notYetDisconnected = true;
    /**
     * communicate with a BLE transport
     */
    _this.exchange = function (apdu) {
      return _this.exchangeAtomicImpl(function () {
        return __awaiter(_this, void 0, void 0, function () {
          var msgIn, data, msgOut, e_6;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _b.trys.push([0, 2, , 5]);
                msgIn = apdu.toString("hex");
                (0, logs_1.log)("apdu", "=> ".concat(msgIn));
                return [
                  4 /*yield*/,
                  (0, rxjs_1.merge)(
                    // $FlowFixMe
                    this.notifyObservable.pipe(receiveAPDU_1.receiveAPDU),
                    (0, sendAPDU_1.sendAPDU)(this.write, apdu, this.mtuSize)
                  ).toPromise(),
                ];
              case 1:
                data = _b.sent();
                msgOut = data.toString("hex");
                (0, logs_1.log)("apdu", "<= ".concat(msgOut));
                return [2 /*return*/, data];
              case 2:
                e_6 = _b.sent();
                (0, logs_1.log)("ble-error", "exchange got " + String(e_6));
                if (!this.notYetDisconnected) return [3 /*break*/, 4];
                // in such case we will always disconnect because something is bad.
                return [
                  4 /*yield*/,
                  bleManager
                    .cancelDeviceConnection(this.id)
                    ["catch"](function () {}),
                ];
              case 3:
                // in such case we will always disconnect because something is bad.
                _b.sent(); // but we ignore if disconnect worked.
                _b.label = 4;
              case 4:
                throw (0, remapErrors_1.remapError)(e_6);
              case 5:
                return [2 /*return*/];
            }
          });
        });
      });
    };
    _this.write = function (buffer, txid) {
      return __awaiter(_this, void 0, void 0, function () {
        var e_7, e_8;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              (0, logs_1.log)("ble-frame", "=> " + buffer.toString("hex"));
              if (!!this.writeCmdCharacteristic) return [3 /*break*/, 5];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                this.writeCharacteristic.writeWithResponse(
                  buffer.toString("base64"),
                  txid
                ),
              ];
            case 2:
              _b.sent();
              return [3 /*break*/, 4];
            case 3:
              e_7 = _b.sent();
              throw new errors_1.DisconnectedDeviceDuringOperation(e_7.message);
            case 4:
              return [3 /*break*/, 8];
            case 5:
              _b.trys.push([5, 7, , 8]);
              return [
                4 /*yield*/,
                this.writeCmdCharacteristic.writeWithoutResponse(
                  buffer.toString("base64"),
                  txid
                ),
              ];
            case 6:
              _b.sent();
              return [3 /*break*/, 8];
            case 7:
              e_8 = _b.sent();
              throw new errors_1.DisconnectedDeviceDuringOperation(e_8.message);
            case 8:
              return [2 /*return*/];
          }
        });
      });
    };
    _this.id = device.id;
    _this.device = device;
    _this.writeCharacteristic = writeCharacteristic;
    _this.writeCmdCharacteristic = writeCmdCharacteristic;
    _this.notifyObservable = notifyObservable;
    _this.deviceModel = deviceModel;
    (0, logs_1.log)(
      "ble-verbose",
      "BleTransport(".concat(String(_this.id), ") new instance")
    );
    return _this;
  }
  /**
   * TODO could add this concept in all transports
   * observe event with { available: bool, string } // available is generic, type is specific
   * an event is emit once and then listened
   */
  BluetoothTransport.observeState = function (observer) {
    var emitFromState = function (type) {
      observer.next({
        type: type,
        available: type === "PoweredOn",
      });
    };
    bleManager.onStateChange(emitFromState, true);
    return {
      unsubscribe: function () {},
    };
  };
  /**
   * Scan for bluetooth Ledger devices
   */
  BluetoothTransport.listen = function (observer) {
    var _this = this;
    (0, logs_1.log)("ble-verbose", "listen...");
    var unsubscribed;
    // $FlowFixMe
    var stateSub = bleManager.onStateChange(function (state) {
      return __awaiter(_this, void 0, void 0, function () {
        var devices;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!(state === "PoweredOn")) return [3 /*break*/, 3];
              stateSub.remove();
              return [
                4 /*yield*/,
                bleManager.connectedDevices(
                  (0, devices_1.getBluetoothServiceUuids)()
                ),
              ];
            case 1:
              devices = _b.sent();
              if (unsubscribed) return [2 /*return*/];
              return [
                4 /*yield*/,
                Promise.all(
                  devices.map(function (d) {
                    return BluetoothTransport.disconnect(d.id)[
                      "catch"
                    ](function () {});
                  })
                ),
              ];
            case 2:
              _b.sent();
              if (unsubscribed) return [2 /*return*/];
              bleManager.startDeviceScan(
                (0, devices_1.getBluetoothServiceUuids)(),
                null,
                function (bleError, device) {
                  if (bleError) {
                    observer.error(bleError);
                    unsubscribe();
                    return;
                  }
                  var res = retrieveInfos(device);
                  var deviceModel = res && res.deviceModel;
                  observer.next({
                    type: "add",
                    descriptor: device,
                    deviceModel: deviceModel,
                  });
                }
              );
              _b.label = 3;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, true);
    var unsubscribe = function () {
      unsubscribed = true;
      bleManager.stopDeviceScan();
      stateSub.remove();
      (0, logs_1.log)("ble-verbose", "done listening.");
    };
    return {
      unsubscribe: unsubscribe,
    };
  };
  /**
   * Open a BLE transport
   * @param {*} deviceOrId
   */
  BluetoothTransport.open = function (deviceOrId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        return [2 /*return*/, open(deviceOrId, true)];
      });
    });
  };
  // TODO we probably will do this at end of open
  BluetoothTransport.prototype.inferMTU = function () {
    return __awaiter(this, void 0, void 0, function () {
      var mtu, mtuSize;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            mtu = this.device.mtu;
            return [
              4 /*yield*/,
              this.exchangeAtomicImpl(function () {
                return __awaiter(_this, void 0, void 0, function () {
                  var e_9;
                  var _this = this;
                  return __generator(this, function (_b) {
                    switch (_b.label) {
                      case 0:
                        _b.trys.push([0, 2, , 4]);
                        return [
                          4 /*yield*/,
                          (0, rxjs_1.merge)(
                            this.notifyObservable.pipe(
                              (0, operators_1.first)(function (buffer) {
                                return buffer.readUInt8(0) === 0x08;
                              }),
                              (0, operators_1.map)(function (buffer) {
                                return buffer.readUInt8(5);
                              })
                            ),
                            (0, rxjs_1.defer)(function () {
                              return (0,
                              rxjs_1.from)(_this.write(Buffer.from([0x08, 0, 0, 0, 0])));
                            }).pipe((0, operators_1.ignoreElements)())
                          ).toPromise(),
                        ];
                      case 1:
                        mtu = _b.sent() + 3;
                        return [3 /*break*/, 4];
                      case 2:
                        e_9 = _b.sent();
                        (0,
                        logs_1.log)("ble-error", "inferMTU got " + String(e_9));
                        return [
                          4 /*yield*/,
                          bleManager
                            .cancelDeviceConnection(this.id)
                            ["catch"](function () {}),
                        ];
                      case 3:
                        _b.sent(); // but we ignore if disconnect worked.
                        throw (0, remapErrors_1.remapError)(e_9);
                      case 4:
                        return [2 /*return*/];
                    }
                  });
                });
              }),
            ];
          case 1:
            _b.sent();
            if (mtu > 23) {
              mtuSize = mtu - 3;
              (0, logs_1.log)(
                "ble-verbose",
                "BleTransport("
                  .concat(String(this.id), ") mtu set to ")
                  .concat(String(mtuSize))
              );
              this.mtuSize = mtuSize;
            }
            return [2 /*return*/, this.mtuSize];
        }
      });
    });
  };
  BluetoothTransport.prototype.requestConnectionPriority = function (
    connectionPriority
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              (0, remapErrors_1.decoratePromiseErrors)(
                this.device.requestConnectionPriority(
                  react_native_ble_plx_1.ConnectionPriority[connectionPriority]
                )
              ),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  BluetoothTransport.prototype.setScrambleKey = function () {};
  BluetoothTransport.prototype.close = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.exchangeBusyPromise) return [3 /*break*/, 2];
            return [4 /*yield*/, this.exchangeBusyPromise];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  var _a;
  _a = BluetoothTransport;
  /**
   *
   */
  BluetoothTransport.isSupported = function () {
    return Promise.resolve(
      typeof react_native_ble_plx_1.BleManager === "function"
    );
  };
  /**
   *
   */
  BluetoothTransport.setLogLevel = function (level) {
    bleManager.setLogLevel(level);
  };
  BluetoothTransport.list = function () {
    throw new Error("not implemented");
  };
  /**
   * Globally disconnect a BLE device by its ID
   */
  BluetoothTransport.disconnect = function (id) {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(_a, function (_b) {
        switch (_b.label) {
          case 0:
            (0, logs_1.log)("ble-verbose", "user disconnect(".concat(id, ")"));
            return [4 /*yield*/, bleManager.cancelDeviceConnection(id)];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return BluetoothTransport;
})(hw_transport_1["default"]);
exports["default"] = BluetoothTransport;
exports.bleManager = bleManager;
//# sourceMappingURL=BleTransport.js.map
