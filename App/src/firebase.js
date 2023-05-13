import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBrjEO53CXtrpmtfCErM_e8jNtH7u6j1JU",
  authDomain: "ib3-app-68bb2.firebaseapp.com",
  projectId: "ib3-app-68bb2",
  storageBucket: "ib3-app-68bb2.appspot.com",
  messagingSenderId: "1048127550162",
  appId: "1:1048127550162:web:89d3d9a160a191908eb30b",
};

let app;
let auth;
if (getApps().length < 1) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth();
}
const storage = getStorage(app);

export { auth, storage };
