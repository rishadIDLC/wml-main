import React, {useEffect} from 'react';
import {Platform, View, StyleSheet} from "react-native";
import {WebView} from "react-native-webview";
import {GetBranches, WebViewURL} from "@/api-requests/base-requests";
import Constants from 'expo-constants';

const Index = () => {
    const InjectedJavascript = `const meta = document.createElement('meta'); meta.setAttribute('content', 'initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `

    useEffect(() => {
        (async() => {
            await GetBranches();
        })()
    }, [])

    return (
        <View style={styles.container}>
            <WebView
                style={styles.container}
                source={{ uri: WebViewURL }}
                injectedJavaScript={InjectedJavascript}
                scrollEnabled
                originWhitelist={['*']}
                scalesPageToFit={Platform.OS !== "android"}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                javaScriptEnabled
                domStorageEnabled
            />
        </View>
    );
}

export default Index;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
});
