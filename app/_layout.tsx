import React, {useEffect, useRef} from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function App() {


  useEffect(()=>{
    (async ()=>{
      await axios.get("https://web.idlc.com/api/v1/get-branch?idlc_category=idlc");
    })();
  },[]);

  const webviewRef = useRef(null);

  const handleFileUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      console.log(result.uri);
      // Handle the selected image file or pass it to the WebView
    }
  };

  const handleWebViewMessage = (event) => {
    const { data } = event.nativeEvent;
    if (data === "fileUpload") {
      handleFileUpload();
    }
  };

  return (
      <View style={styles.container}>
        <WebView
            ref={webviewRef}
            source={{ uri: "https://apps.idlc.com/WMSalesApp/" }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            injectedJavaScript={`
          document.querySelector('input[type="file"]').addEventListener('click', function() {
            window.ReactNativeWebView.postMessage('fileUpload');
          });
        `}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
