// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyCu4hIAgP3b5dJib6S5bPRJkkfpwVy0kK8",
//   authDomain: "whatsapp-clone-3-4e3a7.firebaseapp.com",
//   projectId: "whatsapp-clone-3-4e3a7",
//   storageBucket: "whatsapp-clone-3-4e3a7.appspot.com",
//   messagingSenderId: "800770774525",
//   appId: "1:800770774525:web:5570ef6e7b3f4cbae87594"
// };




const firebaseConfig = {
  apiKey: "AIzaSyAsoyUo08UaHsCYWu4tY397r_AXQtuVXTs",
  authDomain: "web-whatsapp-clone-899a7.firebaseapp.com",
  projectId: "web-whatsapp-clone-899a7",
  storageBucket: "web-whatsapp-clone-899a7.appspot.com",
  messagingSenderId: "839853773470",
  appId: "1:839853773470:web:64a69ef8a5e5d6c914e18f",
  measurementId: "G-P04DJB44ES"
};




// const firebaseConfig = {
//   apiKey: "AIzaSyCFzpQJgwonroJfuuXmkRTsmv5j4Ekh7Yk",
//   authDomain: "whatsapp-clone-3e498.firebaseapp.com",
//   projectId: "whatsapp-clone-3e498",
//   storageBucket: "whatsapp-clone-3e498.appspot.com",
//   messagingSenderId: "1015701625863",
//   appId: "1:1015701625863:web:61e77d5ee2e7ff829f1ea2"
// };


// naitik.2101
// const firebaseConfig = {
//   apiKey: "AIzaSyDccJbIhIAyXgzwssTqcMnAI7zYs1uhPwM",
//   authDomain: "whatsapp-clone-84924.firebaseapp.com",
//   projectId: "whatsapp-clone-84924",
//   storageBucket: "whatsapp-clone-84924.appspot.com",
//   messagingSenderId: "468186854982",
//   appId: "1:468186854982:web:fd2e3146931b6821f37c47"
// };



//const analytics = getAnalytics(app);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // cloud service
export { auth, app, storage };  // storage service
export default db;
