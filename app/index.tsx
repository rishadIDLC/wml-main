import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Platform, View, StyleSheet, Text, BackHandler, Alert} from "react-native";
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
            if(success){
                setLoaded(success);
            }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            !status?.granted && await requestPermissions();

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
        console.log(nativeEvent);
        const { downloadUrl } = nativeEvent;

        if (Platform.OS === "android" || Platform.OS === "ios") {
            const fileUri = `${FileSystem.documentDirectory}${downloadUrl.split("/").pop()}`;
            console.log(fileUri);
            try {
                !mediaStatus?.granted && await requestMediaPermissions();

                const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri);

                // @ts-ignore
                const { uri } = await downloadResumable.downloadAsync();
                alert(`File downloaded to: ${uri}`);
            } catch (error) {
                console.error("Download failed:", error);
                alert("Failed to download the file.");
            }
        } else {
            alert("File download is only supported on mobile platforms.");
        }
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
