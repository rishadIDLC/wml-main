import axios from 'axios';

export const WebViewURL = 'https://apps.idlc.com/WMSalesApp/';
export const BaseURL = '';

export async function GetBranches() {
    try {
        const res = await axios.get("https://web.idlc.com/api/v1/get-branch?idlc_category=idlc");
        console.log(res.data?.details.filter((item, idx) => idx !== 0).length);
        return true;
    }
    catch (error) {
        if (error.response) {
            console.log("Server responded with a status:", error.response.status);
            console.log("Data:", error.response.data);
        } else if (error.request) {
            console.log("No response received:", error.request);
        } else {
            console.log("Error setting up request:", error.message);
        }
        return false;
    }
}
