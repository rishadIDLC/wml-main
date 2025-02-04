import React from 'react';
import LottieView from "lottie-react-native";
import {StyleSheet, View} from "react-native";
import UtilityStore from "../store/utility-store";

const FullScreenLoading = () => {
    const {isLoading} = UtilityStore();

    return (
        isLoading && <View style={styles.animationContainer}>
            <LottieView
                autoPlay loop
                style={{width: 200, height: 200}}
                source={require('../assets/animation/loading6.json')}
            />
        </View>
    );
};

export default FullScreenLoading;

const styles = StyleSheet.create({
    animationContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
})
