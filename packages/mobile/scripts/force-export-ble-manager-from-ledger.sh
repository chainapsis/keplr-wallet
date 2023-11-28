#!/usr/bin/env bash

# react-native-ble-plx requires only one instance of BLEManager exists.
# But, react-native-hw-transport-ble uses their instance without exporting that.
# So, to use the react-native-hw-transport-ble's ble manager instance,
# temporarily change the their source code by force.

DIR="$( cd "$( dirname "$0" )" && pwd -P )"

cp ${DIR}/BleTransport.d.ts ${DIR}/../node_modules/@ledgerhq/react-native-hw-transport-ble/lib/BleTransport.d.ts
cp ${DIR}/BleTransport.js ${DIR}/../node_modules/@ledgerhq/react-native-hw-transport-ble/lib/BleTransport.js
