import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { TextInput } from "../../text-input";
import { Back } from "../components/back";
import { Button } from "../../button";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";

export function SendScreen() {
    return <SafeAreaView style={{ backgroundColor: 'rgba(9, 8, 23, 1);', flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <View >
            <View style={{ flexDirection: 'row', }}>
                <Back style={{ alignSelf: 'flex-start', zIndex: 2 }} />
                <Text style={{ width: '100%', textAlign: 'center', marginLeft: -20, color: '#F6F5FF', fontWeight: '600' }}>Send</Text>
            </View>
            <View style={{ marginTop: 55, flexDirection: 'row', alignItems: 'flex-end' }}>
                <TextInput label="to" placeholder="Wallet Address" style={{ flex: 1 }} />
                <View style={{ width: 64, height: 64, backgroundColor: 'red' }} />
            </View>
            <View style={{ marginTop: 35, }}>
                <Text style={{ color: '#787B9C', fontSize: 10, marginBottom: 12 }}>AMOUNT</Text>
                <View style={{ borderWidth: 1, borderRadius: 12, borderColor: '#2F2B4C', padding: 4, flexDirection: 'row' }} >
                    <View style={{ borderRadius: 12, width: 150, backgroundColor: '#17162C', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: 44, height: 44, backgroundColor: 'orange', marginRight: 12, borderRadius: 44 }} />
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ color: '#F6F5FF', fontWeight: '500', fontSize: 14 }}>bitcoin</Text>
                                <Text style={{ color: '#999CB6' }}>BTC</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faAngleDown} style={{ color: '#7B87A8' }} />
                        </View>
                    </View>
                    <TextInput
                        style={{ alignSelf: 'center', borderColor: 'transparent', flex: 1, paddingLeft: 20, paddingRight: 10 }}
                        inputStyle={{ borderColor: 'transparent', textAlign: 'right', fontSize: 18, fontWeight: '500', }}
                        placeholder={"0"}
                    />

                </View>

            </View>
        </View>
        <Button flavor={"blue"} label={"Next"} RightIcon={faAngleDoubleRight} />
    </SafeAreaView >
}
