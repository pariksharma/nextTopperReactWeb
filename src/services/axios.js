import axios from "axios";

let appIdStore = null;

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  })

// export const setAppId = (appId) => {
//     appIdStore = appId;
//     console.log('appIdStore', appIdStore)
// };

axiosClient.interceptors.request.use((req) => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem('jwt') : ""
    const user_id = typeof window !== "undefined" ? localStorage.getItem('user_id') : ""
    const app_id = typeof window !== "undefined" ? localStorage.getItem('appId') : ""


    const headers = {
            'Jwt': jwt ? jwt : "jwt",
            'Userid': user_id ? user_id : 0,
            'Devicetype': 4,
            'Version': 1,
            'Lang': 1,
            // 'Centerid:'.$Centerid,
            'Content-Type': 'application/json',
            "Authorization": "Bearer 01*#NerglnwwebOI)30@I*Dm'@@",
            "Appid": app_id ? app_id : '' ,
            // "User-Agent":'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            // "User-Agent": navigator.userAgent
    }

    req.headers = headers

    return req
}, (error) => Promise.reject(error))

export default axiosClient