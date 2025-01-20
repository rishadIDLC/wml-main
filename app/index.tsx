import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Platform, View, StyleSheet, Text, BackHandler, Alert, Linking} from "react-native";
import {WebView} from "react-native-webview";
import {GetBranches, WebViewURL} from "@/api-requests/base-requests";
import Constants from 'expo-constants';
import {useCameraPermissions, useMediaLibraryPermissions} from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const Index = () => {
    const [loaded, setLoaded] = useState(false)
    const InjectedJavascript = `const meta = document.createElement('meta'); meta.setAttribute('content', 'initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `
    const [status, requestPermissions] = useCameraPermissions();
    const [mediaStatus, requestMediaPermissions] = useMediaLibraryPermissions();
    const webViewRef = useRef(null);
    const [canGoBack, setCanGoBack] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            let success = await GetBranches();
            success && setLoaded(success);
        })()
    }, []);

    useEffect(() => {
        (async () => {
            !status?.granted && await requestPermissions();
            !mediaStatus?.granted && await requestMediaPermissions();
        })()
    }, [status, mediaStatus]);

    const handleBackPress = () => {
        if (canGoBack) {
            // @ts-ignore
            webViewRef.current.goBack();
            return true; // Prevent default back behavior
        }
        else {
            Alert.alert(
                "Exit App",
                "Are you sure you want to exit the app?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Exit", onPress: () => BackHandler.exitApp() },
                ],
                { cancelable: true }
            );
            return true; // Prevent default back behavior
        }
    };

    // @ts-ignore
    const handleFileDownload = async ({ nativeEvent }) => {
        const { downloadUrl } = nativeEvent;
        downloadUrl && await Linking.openURL(downloadUrl);
    };

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => backHandler.remove(); // Cleanup
    }, [canGoBack]);

    return (
        <View style={styles.container}>
            {loaded ?
                <WebView
                    ref={webViewRef}
                    style={{flex: 1}}
                    source={{ uri: WebViewURL }}
                    injectedJavaScript={InjectedJavascript}
                    onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
                    onFileDownload={handleFileDownload}
                    scrollEnabled
                    originWhitelist={['*']}
                    scalesPageToFit={Platform.OS !== "android"}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback
                    javaScriptEnabled
                    domStorageEnabled
                />
                : <Text>Loading...</Text>
            }
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
