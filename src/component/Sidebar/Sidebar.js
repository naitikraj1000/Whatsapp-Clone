import React, { useEffect } from "react";
import { useState } from "react";
import { HiOutlineUserCircle } from "react-icons/hi";
import { FiMoreVertical } from "react-icons/fi";
import { MdOutlineDonutLarge } from "react-icons/md";
import { BsFillChatLeftTextFill, BsSearch } from "react-icons/bs";
import { Link, useParams, BrowserRouter as Routers } from 'react-router-dom';
import Style from "./Sidebar.module.scss";
import SidebarChat from "../SidebarChat/SidebarChat";
import Setting from "../Setting/Profilesetting";
import db from "../../firebase";
import {
	collection,
	onSnapshot, getDoc, getDocs,
	doc,
	addDoc,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, app, s } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Groupprofilesettings from "../Setting/Groupprofilesetting";

const Sidebar = () => {
	const [menu, setMenu] = useState(false);
	const [addNew, setAddNew] = useState(false);
	const [addNewFriend, setAddNewFriend] = useState(false);
	const [rooms, setRooms] = useState([]);
	const [NewRoomName, setNewRoomName] = useState("");
	const [NewFriend, setNewFriend] = useState("");
	const [user] = useAuthState(auth);
	const email = user.email ?? "abc@gmail.com";
	let connRef = collection(db, 'rooms');
	const [profile, setProfile] = useState(user.photoURL);
	const { roomId } = useParams();


	useEffect(() => {
		let temp_connRef = collection(doc(connRef, email), "grp");
		let all_grp = [];

		const getRooms = async () => {
			try {
				const ownGroupSnapshot = await getDocs(temp_connRef);
				all_grp = ownGroupSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));

				const friendGroupSnapshot = await getDocs(collection(connRef, email, "friend_grp"));
				const friendGroups = friendGroupSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));

				// Create an array of promises for each getDoc operation
				let getDocPromises = friendGroups.map(async (element) => {
					const docRef = element.data.URL;
					// console.log("docRef: ", docRef);
					const docSnapshot = await getDoc(docRef);
					return { id: element.id, data: docSnapshot.data() };
				});

				// Wait for all promises to resolve
				const friendGroupData = await Promise.all(getDocPromises);

				// Combine the own group and friend group data

				const friends = await getDocs(collection(doc(collection(db, "rooms"), email), "friend"));
				const friendList = friends.docs.map((doc) => ({ id: doc.id, data: doc.data() }));

				getDocPromises = [];
				getDocPromises = friendList.map(async (element) => {
					const docRef = element.data.url;
					const docSnapshot = await getDoc(docRef);
					return { id: element.id, data: docSnapshot.data() };
				});


				const friendData = await Promise.all(getDocPromises);

				const combinedGroups = [...all_grp, ...friendGroupData, ...friendData];
				setRooms(combinedGroups);
				// console.log("all_grp: ", combinedGroups);
			} catch (error) {
				console.log("Failed to fetch groups: ", error.message);
			}
		};

		getRooms();
	}, [connRef, email]);



	const addNewGroup = (e) => {
		e.preventDefault();
		const grp_name_database = email + NewRoomName;
		if (grp_name_database) {
			const addNewGroup = async () => {
				try {
					// doc ->documeID , collection -> collectionID

					const docRef = doc(connRef, email, "grp", grp_name_database);

					await setDoc(docRef, {
						bio: "Set your bio here",
						email: email,
						identification: NewRoomName,
						name: grp_name_database,
						timestamp: serverTimestamp(),
						profile: user.photoURL,
					});
					console.log("Document successfully written!");
				} catch (error) {
					// alert(error.message);
					// console.log("Naitik: ", error.message);
				}
			};
			addNewGroup();
		}
		setNewRoomName("");
		setAddNew(false);
	};


	const addFriend = (e) => {
		e.preventDefault();
		const friend_email = NewFriend;
		if (friend_email) {
			const addNewFriend = async () => {
				try {

					const docRef = doc(collection(doc(collection(db, "rooms"), email), "friend"), friend_email);

					await setDoc(docRef, {
						identification: friend_email,
						profile: user.photoURL,
						email: friend_email,
						timestamp: serverTimestamp(),
						url: doc(collection(db, "rooms"), friend_email),
					});
					console.log("Friend Added Successfull!");
				} catch (error) {
					// alert(error.message);
					console.log("addFriend: ", error.message);
				}
			};
			addNewFriend();
		}
		setNewFriend("");
		setAddNewFriend(false);
	}

	useEffect(() => {

		const fetchUserData = async () => {
			try {
				const userDocRef = doc(collection(db, "rooms"), user.email);


				const userDocSnap = await getDoc(userDocRef);

				if (userDocSnap && userDocSnap.exists()) {
					const userData = userDocSnap.data();
					setProfile(userData.profile);

				} else {
					console.log("Document does not exist or data retrieval failed.");
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUserData();
	}, []);

	return (
		<div className={`${Style.sidebar}`}>
			{/* <Groupprofilesettings room={roomId} /> */}
			{/* sidebar header  */}
			<div className={`flex justify-between px-4 py-2`}>
				<div>
					<button className={`${Style.sidebar__btn_head} rounded-full`}>
						<img src={profile} alt="user" srcSet="" />
					</button>
				</div>
				<div className={`inline-flex relative `}>
					<button className={`${Style.sidebar__btn} rounded-full`}>
						<MdOutlineDonutLarge />{" "}
					</button>


					<div
						className={`bg-[#00a884] py-4 px-4 rounded-lg absolute   ${Style.addnew__room
							}  ${addNew ? "block" : "hidden"} `}
						id="addnewGroup__container"
					>
						<form action="">
							<input
								value={NewRoomName}
								onChange={(e) => {
									setNewRoomName(e.target.value);
								}}
								className="  rounded-lg px-1 border-none outline-none py-1"
								type="text"
								placeholder="Add new Room"
								name="newChat"
								id=""
							/>
							<button className="hidden" type="submit" onClick={addNewGroup}>
								add new
							</button>
						</form>
					</div>



					<div
						className={`bg-[#00a884] py-4 px-4 rounded-lg absolute   ${Style.addnew__room
							}  ${addNewFriend ? "block" : "hidden"} `}
						id="addnewFriend__container"
					>
						<form action="">
							<input
								value={NewFriend}
								onChange={(e) => {
									setNewFriend(e.target.value);
								}}
								className="  rounded-lg px-1 border-none outline-none py-1"
								type="text"
								placeholder="Add new Friend"
								name="newChat"
								id=""
							/>
							<button className="hidden" type="submit" onClick={addFriend}>
								add new
							</button>
						</form>
					</div>




					<button
						onClick={() => { setMenu(!menu); setAddNew(false); setAddNewFriend(false) }}
						className={`${Style.sidebar__btn} rounded-full`}
					>
						<FiMoreVertical />{" "}
					</button>

					<div
						className={`py-2 bg-white flex-col absolute top-full right-0 rounded-md overflow-hidden shadow-xl  ${menu ? "flex" : "hidden"
							} `}
					>
						<button
							className={` bg-white hover:bg-[#ebebeb] w-28 py-1`}
							onClick={() => setAddNewFriend(!addNewFriend)}
						>
							Add Friend
						</button>

						<button
							className={` bg-white hover:bg-[#ebebeb] w-28 py-1`}
							onClick={() => setAddNew(!addNew)}
						>
							New Group
						</button>



						<Link className={`bg-white hover:bg-[#ebebeb] w-28 py-1 flex items-center justify-center`} to="/profilesetting">
							Settings
						</Link>


						<button
							className={` bg-white hover:bg-[#ebebeb] w-28 py-1`}
							onClick={() => {
								signOut(auth);
							}}
						>
							Log Out
						</button>

					</div>


				</div>
			</div>

			{/* sidebar search  */}
			<div className={`${Style.sidebar__search}`}>
				<div className={`${Style.searchbar__container}`}>
					<span className="text-[gray] p-2">
						{" "}
						<BsSearch />
					</span>
					<input
						type="text"
						className="searchbar"
						placeholder="Search or Start new Chat"
					/>
				</div>
			</div>

			{/* sidebar chats */}
			<div className={`${Style.sidebar__chat}`}>
				{rooms.map((room) => {
				
					return (
						<SidebarChat
							img={room.data.profile}
							key={room.id}
							id={room.id}
							name={room.data.identification || "Set Ur Identification"}
							message={"hey ! i'm using WhatsApp"}
						/>
					);
				})}
			</div>

		</div>
	);
};
export default Sidebar;
