import React from "react";
import { SafeAreaView, View, Text, Image, Button, Pressable } from "react-native";

const Background = ({style}) => {
    return <View style={{ justifyContent: 'space-between', backgroundColor: '#1E1E1E', height: '100%', ...style }}>

            <View style={{ flex: 1, position: 'relative' }}>
            {/* <FontAwesomeIcon icon={faChevronLeft} style={{ color: '#7B87A8', marginLeft: 5, marginTop: 5 }} /> */}
            <Image source={require('../assets/backgroundblue.png')} style={{ alignSelf: 'flex-end' }} />
            <Image source={require('../assets/backgroundpink.png')} style={{ position: 'absolute', zIndex: -1, left: 0 }} />
            </View>
               </View >
}
export default Background;