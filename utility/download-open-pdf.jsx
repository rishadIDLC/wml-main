import {Alert, Platform} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from "expo-intent-launcher";
import UtilityStore from "../store/utility-store";

const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to enable notifications for this feature.');
    }
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const scheduleNotification = async (pdfUri) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'PDF Downloaded',
            body: 'Tap to open the PDF file.',
            data: { pdfUri }, // Pass the PDF URI in the notification payload
        },
        trigger: null, // Send immediately
    });
};

export const openPDF = async (pdfUri) => {
    if (Platform.OS === 'android') {
        try {
            const contentUri = await FileSystem.getContentUriAsync(pdfUri);

            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1,
                type: 'application/pdf',
            });
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Error', 'No PDF viewer app found. Please install a PDF viewer like Adobe Acrobat.');
        }
    } else {
        await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Open PDF',
        });
    }
};

const downloadAndOpenPDF = async (pdfUrl) => {
    UtilityStore.getState().setIsLoading(true);
    let pdfName = pdfUrl.split("/")[pdfUrl.split("/").length - 1];
    pdfName = pdfName.includes(".pdf") ? pdfName : pdfName + ".pdf";
    const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl, FileSystem.documentDirectory + pdfName,
    );

    try {
        const { uri } = await downloadResumable.downloadAsync();
        await scheduleNotification(uri);
        await openPDF(uri);
        UtilityStore.getState().setIsLoading(false);
    } catch (error) {
        console.error('Download failed:', error);
        Alert.alert('Download Failed', 'An error occurred while downloading the file.');
        UtilityStore.getState().setIsLoading(false);
    }
};

export default async function DownloadOpenPdf(url) {
    await requestPermissions();
    await downloadAndOpenPDF(url);
    // handleNotificationClick();
}
