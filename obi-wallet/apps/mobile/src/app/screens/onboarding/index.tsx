import { Home } from "@obi-wallet/common";
import React from "react";
import { SafeAreaView, View, Text, Image, Button, Pressable } from "react-native";

import { useNavigation } from "../../stack";
import { useStore } from "../../stores";

export function Onboarding() {
  const { appsStore } = useStore();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{justifyContent:'space-between', backgroundColor:'#1E1E1E', height:'100%'}}>
        <View style={{ flex:6, position:'relative'}}>
            <Image source={require('./assets/backgroundblue.png')} />
            <Image source={require('./assets/backgroundpink.png')} style={{position:'absolute', zIndex:-1}}/>
        </View>
        <View  style={{flex:4, paddingRight:20, paddingLeft:20, justifyContent: "space-between"}}>
            <View style={{flex:1}}>
                <Image source={require('./assets/loop.png')}/>
                <Text style={{color:'#F6F5FF', fontSize:32, fontWeight:'600', marginTop:32}}>Welcome to Loop</Text>
                <Text style={{color:'#999CB6', fontSize:16, fontWeight:'400', marginTop:12}}>Loop, powered by Obi, is the world’s most powerful wallet for web3 </Text>
            </View>
            <Pressable style={{backgroundColor:'#59D6E6', width:335, height:56, borderRadius:12, justifyContent: 'center', alignItems:'center', marginBottom:48}}>
                <Text style={{color:'#040317', fontWeight:'bold', fontSize:16}}>Get Started >></Text>
            </Pressable>
        </View>
    </SafeAreaView>
  );
}


