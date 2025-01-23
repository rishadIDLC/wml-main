import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Platform, View, StyleSheet, Text, BackHandler, Alert} from "react-native";
import {WebView} from "react-native-webview";
import {GetBranches, WebViewURL} from "@/api-requests/base-requests";
import Constants from 'expo-constants';
import {useCameraPermissions, useMediaLibraryPermissions} from "expo-image-picker";
import {Directory, File, Paths} from 'expo-file-system/next'
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

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

    const handleDownload = async (url:string) => {
        const destination = new Directory(Paths.cache, 'pdfs');
        destination.create();
        const output = await File.downloadFileAsync(url, destination);
        FileSystem.getContentUriAsync(output.uri).then(cUri => {
            IntentLauncher.startActivityAsync('android.intent.action.VIEW', {data: cUri, flags: 1});
        });
    }

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
                    onNavigationStateChange={async (navState) => {
                        setCanGoBack(navState.canGoBack);

                        if(navState.url.includes("get/lead/document")){
                            console.log(navState.url);
                            await handleDownload(navState.url);
                        }
                    }}
                    blobDownloadingEnabled
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
