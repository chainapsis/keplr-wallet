#!/usr/bin/env bash

# react-native-ble-plx requires only one instance of BLEManager exists.
# But, react-native-hw-transport-ble uses their instance without exporting that.
# So, to use the react-native-hw-transport-ble's ble manager instance,
# temporarily change the their source code by force.

DIR="$( cd "$( dirname "$0" )" && pwd -P )"

cp ${DIR}/ledger/BleTransport.d.ts ${DIR}/../../node_modules/@ledgerhq/react-native-hw-transport-ble/lib/BleTransport.d.ts
cp ${DIR}/ledger/BleTransport.js ${DIR}/../../node_modules/@ledgerhq/react-native-hw-transport-ble/lib/BleTransport.js

# https://github.com/software-mansion/react-native-reanimated/issues/4783#issuecomment-1732498548
# codepush에서 restart 문제를 해결하기 위해서 대충 이렇게 처리한다.
# 적절해보이는 방법은 아니지만... 이게 아니면 해결법을 찾을 수가 없다...
cp ${DIR}/restart-fix/JSCRuntime.cpp ${DIR}/../../node_modules/react-native/ReactCommon/jsc/JSCRuntime.cpp
