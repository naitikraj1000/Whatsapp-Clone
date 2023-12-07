// GrouProfileSettings.js

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db, { storage } from "../../firebase";
import { collection, setDoc, updateDoc } from "firebase/firestore";
import {
    getDocs,
    doc,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query,
    getDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";



const Groupprofilesettings = () => {
    const { groupId } = useParams();
    console.log("groupId: ", groupId);
    const [user] = useAuthState(auth);
    let ProfileRef, ProfileURLs;
    const [profile, setProfile] = useState();
    const [isClick, SetIsClick] = useState(false);
    const [userInfo, setUserInfo] = useState({
        identification: { groupId },
        name: { groupId },
        email: user.email,
        bio: "Set your Desc here",
        profile: user.photoURL, // Default Grp profile picture URL
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({ ...prevUserInfo, [name]: value }));
    };

    const handleFileInputChange = async (e) => {
        const file = e.target.files[0];
        setProfile(file);
        const reader = new FileReader();
        SetIsClick(true);
        reader.onload = () => {
            setUserInfo((prevUserInfo) => ({
                ...prevUserInfo,
                profile: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    const submit = async (e) => {
        e.preventDefault();


        const ProfileRef = ref(storage, `${user.email}/${groupId}/Profile`);
        if (isClick) {
            await uploadBytes(ProfileRef, profile);
            ProfileURLs = await getDownloadURL(ProfileRef);
            console.log("ProfileURLs: ", ProfileURLs);
        }

        const userRef = collection(db, "rooms");
        const userDocRef = doc(collection(doc(userRef, user.email), "grp"), groupId);
        // const usercoll = collection(userDocRef, "profile");

        // const profileDocRef = doc(usercoll, "Profile");
        const profileDocSnapshot = await getDoc(userDocRef);

        if (profileDocSnapshot.exists()) {
            console.log("Document exists ");
            // Document exists, update it
            await updateDoc(userDocRef, {
                identification: userInfo.name,
                name: userInfo.name,
                bio: userInfo.bio,
                time: serverTimestamp(),
            });

            if (isClick) {
                await updateDoc(userDocRef, {
                    identification: userInfo.name,
                    profile: ProfileURLs,
                });
            }
        } else {
            console.log("Document does not exist");
            // Document doesn't exist, create it
            await setDoc(userDocRef, {
                identification: userInfo.name,
                name: userInfo.name,
                bio: userInfo.bio,
                time: serverTimestamp(),
            });

            if (isClick) {
                await updateDoc(userDocRef, {
                    profile: ProfileURLs,
                });
            }
        }

        SetIsClick(false);
    };





    useEffect(() => {

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(collection(doc(collection(db, "rooms"), user.email), "grp"), groupId)

                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap && userDocSnap.exists()) {
                    const userData = userDocSnap.data();



                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        name: userData.name || user.displayName,
                        bio: userData.bio || "Set your bio here",
                        profile: userData.profile || user.photoURL,
                    }));
                } else {
                    console.log("Document does not exist or data retrieval failed.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        marginLeft: "40px",
        width: "calc(100% - 80px)",
    };

    const profileSettingsStyle = {
        width: "80%",
        maxWidth: "600px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        textAlign: "center",
        marginLeft: "40px", // Adjust the margin to your preference
    };

    const sectionStyle = {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
    };

    const pictureStyle = {
        position: "relative",
        width: "120px",
        height: "120px",
        overflow: "hidden",
        borderRadius: "50%",
        cursor: "pointer",
        marginBottom: "20px",
    };

    const fileInputStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    };

    const imgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "80%",
    };

    const detailsStyle = {
        width: "100%",
        textAlign: "left",
    };

    const labelStyle = {
        display: "block",
        fontWeight: "bold",
        marginTop: "10px",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        border: "1px solid #ddd",
        borderRadius: "5px",
    };

    const buttonStyle = {
        marginTop: "10px",
        backgroundColor: "#128c7e",
        color: "#fff",
        padding: "4px",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
    };

    const saveButtonStyle = {
        backgroundColor: "#128c7e",
        color: "#fff",
        padding: "12px 24px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
    };

    return (
        <div style={containerStyle}>
            <div style={profileSettingsStyle}>
                <h1>Profile Settings</h1>
                <div style={sectionStyle}>
                    <div style={{ ...pictureStyle }}>
                        <input
                            type="file"
                            onChange={handleFileInputChange}
                            style={fileInputStyle}
                        />
                        <img
                            src={userInfo.profile}
                            alt="Profile"
                            style={imgStyle}
                            className="rounded-full"
                        />
                    </div>

                    <div style={detailsStyle}>
                        <label style={labelStyle}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={userInfo.name}
                            onChange={handleInputChange}
                            style={inputStyle}
                        />
                        <label style={labelStyle}>Grp-Admin-Email</label>
                        <input
                            type="email"
                            name="Grp-Admin-Email"
                            value={userInfo.email}
                            onChange={handleInputChange}
                            style={inputStyle}
                            readOnly={true}
                        />


                        <label style={labelStyle}>Grp Description</label>
                        <textarea

                            name="bio"
                            value={userInfo.bio}
                            onChange={handleInputChange}
                            style={inputStyle}
                        />
                    </div>
                </div>
                <div style={saveButtonStyle}>
                    <form action="">
                        <button style={buttonStyle} onClick={submit}>
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Groupprofilesettings;
