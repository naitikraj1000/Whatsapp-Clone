import React, { useEffect } from 'react';
import { useSignInWithGoogle, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from './WhatsApp.svg.png';
import db, { storage } from "../../firebase";
import {
	getDocs,
	doc,
	addDoc,
	onSnapshot,
	serverTimestamp,
	orderBy,
	query,
	getDoc,
	setDoc,
} from "firebase/firestore";
const SignIn = () => {
	const [user] = useAuthState(auth);
	const [signInWithGoogle] = useSignInWithGoogle(auth);
	const location = useLocation();
	const navigate = useNavigate();
	const dest = location.state?.from || '/';


	useEffect(() => {
		if (user) {
			// console.log(dest);
			if (user.metadata.creationTime === user.metadata.lastSignInTime) {
				// first time login
				console.log("first time login");
				let set_prfile = async () => {
					const docRef = doc(db, "rooms", user.email);
					await setDoc(docRef, {
						identification: user.email,
						name: user.displayName,
						email: user.email,
						bio: "Set your bio here",
						profile: user.photoURL, // Default profile picture URL
					});
				}

				set_prfile();
				console.log("Profile set");

			}
			navigate(dest);
		}
	}, [user]);

	return (
		<div className='flex justify-center items-center flex-col'>
			<div>
				<img src={logo} alt="" />
			</div>
			<div   >
				<button onClick={() => signInWithGoogle()} className='mx-auto px-8 py-1 
				border-2 border-white rounded-lg mt-10 hover:bg-orange-500 hover:text-white '>Google</button>
			</div>
		</div>
	);
}
export default SignIn;