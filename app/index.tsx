import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Platform, View, StyleSheet, Text, BackHandler, Alert} from "react-native";
import {WebView} from "react-native-webview";
import {GetBranches, WebViewURL} from "@/api-requests/base-requests";
import Constants from 'expo-constants';
import {useCameraPermissions, useMediaLibraryPermissions} from "expo-image-picker";
import DownloadOpenPdf, {openPDF} from "@/utility/download-open-pdf";
import * as Notifications from "expo-notifications";
import LottieView from "lottie-react-native";

const Index = () => {
    const [loaded, setLoaded] = useState(false);
    const InjectedJavascript = `const meta = document.createElement('meta'); meta.setAttribute('content', 'initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `
    const [status, requestPermissions] = useCameraPermissions();
    const [mediaStatus, requestMediaPermissions] = useMediaLibraryPermissions();
    const webViewRef = useRef(null);
    const [canGoBack, setCanGoBack] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            let success = await GetBranches();
            setLoaded(success);
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

    React.useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(async res => {
            const {pdfUri} = res.notification.request.content.data;
            console.log(pdfUri);
            await openPDF(pdfUri);
        });
        return () => subscription.remove();
    }, []);

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => backHandler.remove(); // Cleanup
    }, [canGoBack]);

    return (
        <View style={styles.container}>
            {loaded ? <WebView
                ref={webViewRef}
                style={{flex: 1}}
                source={{uri: WebViewURL}}
                injectedJavascript={InjectedJavascript}
                onNavigationStateChange={(navState) => {
                    setCanGoBack(navState.canGoBack);
                }}
                incognito={true}
                javaScriptCanOpenWindowsAutomatically={true}

                onOpenWindow={async (syntheticEvent) => {
                    const {targetUrl} = syntheticEvent?.nativeEvent;
                    console.log('Intercepted OpenWindow for', targetUrl)
                    Platform.OS === "android" && await DownloadOpenPdf(targetUrl);
                }}

                onShouldStartLoadWithRequest={(request) => {
                    if (request.url.toLowerCase().includes('get/lead/document')) {
                        console.log("PDF URL detected:", request.url);
                        Platform.OS === "ios" && DownloadOpenPdf(request.url);
                        return false; // Prevent WebView from opening the PDF
                    }
                    return true; // Allow WebView to load URL
                }}
                setSupportMultipleWindows={true}
                setBuiltInZoomControls={false}
            /> : <View style={styles.animationContainer}>
                <LottieView
                    autoPlay loop
                    style={{width: 200, height: 200}}
                    source={require('../assets/animation/loading6.json')}
                />
            </View>}
        </View>
    );
}

export default Index;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
    animationContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },

});
