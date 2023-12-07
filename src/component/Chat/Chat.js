import React, { useState, useEffect, useCallback } from "react";
// import from 'react';
import Style from "./Chat.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  BsFillCameraVideoFill,
  BsSearch,
  BsThreeDotsVertical,
  BsEmojiHeartEyes,
  BsMic,
} from "react-icons/bs";
import { IoAttachOutline } from "react-icons/io5";
import { useParams, Link } from "react-router-dom";
import db, { auth, storage } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import groupprofilesettings from "../Setting/Groupprofilesetting";
import { Button } from "react-bootstrap";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import { useNavigate } from 'react-router-dom'
const Chat = () => {
  const [menu, setMenu] = useState(false);
  const [input, setInput] = useState("");
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState([]);
  const connRef = collection(db, "rooms");
  const [user] = useAuthState(auth);
  const email = user.email ?? "abc@gmail.com";
  const [emailbox, setEmailBox] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // to check if user is admin of group or not usign UseEffect
  const [isVideo, setIsVideo] = useState(false);
  const [run, setRun] = useState(false);
  let randomroom = roomId
  useEffect(() => {
    randomroom = roomId;
    let get_grp_admin_email = "";
    if (roomId) {
      for (let i = 0; i < roomId.length; i++) {
        if (roomId[i] == ".") {
          get_grp_admin_email += ".com";
          break;
        } else {
          get_grp_admin_email += roomId[i];
        }
      }

      if (roomId.length === get_grp_admin_email.length) {
        console.log("True ", get_grp_admin_email);
        setIsVideo(true);
      } else {
        console.log("False ", get_grp_admin_email);
        setIsVideo(false);
      }

      if (get_grp_admin_email == email) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      let get_grp_admin_email = "";
      console.log("GET MESSAGE  ");
      for (let i = 0; i < roomId.length; i++) {
        if (roomId[i] == ".") {
          get_grp_admin_email += ".com";
          break;
        } else {
          get_grp_admin_email += roomId[i];
        }
      }
      let real_email = get_grp_admin_email;

      const getRoomName = async () => {
        let temp_connRef = doc(
          collection(doc(connRef, real_email), "grp"),
          roomId
        );
        let friend_connRef = doc(
          collection(doc(connRef, email), "friend"),
          roomId
        );
        if (real_email == roomId) temp_connRef = friend_connRef;

        onSnapshot(temp_connRef, (snapshot) => {
          setRoomName(snapshot.data().identification);
        });
      };

      const getMessages = async () => {
        if (real_email === roomId) {
          let temp_connRef1 = query(
            collection(
              doc(collection(doc(connRef, email), "friend"), roomId),
              "messages"
            )
          );

          let temp_connRef2 = query(
            collection(
              doc(collection(doc(connRef, roomId), "friend"), email),
              "messages"
            )
          );

          try {
            let [arr1, arr2] = await Promise.all([
              new Promise((resolve, reject) => {
                onSnapshot(
                  temp_connRef1,
                  (snapshot) => {
                    const messages = snapshot.docs
                      .map((doc) => ({ data: doc.data() }))
                      .slice()
                      .sort((a, b) => a.data.timestamp - b.data.timestamp);
                    resolve(messages);
                  },
                  reject
                );
              }),
              new Promise((resolve, reject) => {
                onSnapshot(
                  temp_connRef2,
                  (snapshot) => {
                    const messages = snapshot.docs
                      .map((doc) => ({ data: doc.data() }))
                      .slice()
                      .sort((a, b) => a.data.timestamp - b.data.timestamp);
                    resolve(messages);
                  },
                  reject
                );
              }),
            ]);

            setMessage(
              [...arr1, ...arr2].sort(
                (a, b) => a.data.timestamp - b.data.timestamp
              )
            );
            console.log("Message Get Successfully: ");
          } catch (error) {
            console.log("Error loading messages: ", error);
          }
        } else {
          let temp_connRef = query(
            collection(
              doc(collection(doc(connRef, real_email), "grp"), roomId),
              "messages"
            )
          );

          try {
            onSnapshot(temp_connRef, (snapshot) => {
              setMessage(
                snapshot.docs
                  .map((doc) => ({ data: doc.data() }))
                  .slice()
                  .sort((a, b) => a.data.timestamp - b.data.timestamp)
              );
            });
          } catch (error) {
            console.log("Error loading messages: ", error);
          }
        }
      };

      getRoomName();
      getMessages();
    }
  }, [roomId, run]);

  const sendMessage = async (e) => {
    e.preventDefault();

    let get_grp_admin_email = "";

    for (let i = 0; i < roomId.length; i++) {
      if (roomId[i] == ".") {
        get_grp_admin_email += ".com";
        break;
      } else {
        get_grp_admin_email += roomId[i];
      }
    }
    let real_email = get_grp_admin_email;

    if (input === "" && selectedFiles.length === 0) {
      return null;
    }

    if (roomId) {
      try {
        let downloadURLs = [];
        let file_name = [];
        // console.log("selectedFiles: ", selectedFiles.length)
        if (selectedFiles.length > 0) {
          // Use Promise.all to wait for all asynchronous operations to complete

          if (real_email == roomId) {
            // special case for friend
            await Promise.all(
              selectedFiles.map(async (file) => {
                const fileRef = ref(storage, `${email}/${roomId}/${file.name}`);
                await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(fileRef);
                downloadURLs.push(downloadURL);
                file_name.push(file.name);
                console.log("Download URL:", downloadURL);
              })
            );
          } else {
            await Promise.all(
              selectedFiles.map(async (file) => {
                const fileRef = ref(
                  storage,
                  `${real_email}/${roomId}/${file.name}`
                );

                await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(fileRef);
                downloadURLs.push(downloadURL);
                file_name.push(file.name);
                console.log("Download URL:", downloadURL);
              })
            );
          }

          console.log("Successfully Uploaded Files to Firebase Storage");
        }

        // console.log("downloadURLs Array: ", downloadURLs);
        let temp_connRef;
        if (real_email === roomId) {
          temp_connRef = doc(
            collection(
              doc(collection(doc(connRef, email), "friend"), roomId),
              "messages"
            )
          );
        } else {
          temp_connRef = doc(
            collection(
              doc(collection(doc(connRef, real_email), "grp"), roomId),
              "messages"
            )
          );
        }

        await setDoc(temp_connRef, {
          filename: file_name,
          URL: downloadURLs,
          message: input,
          email: user.email,
          name: user.displayName,
          timestamp: new Date(),
        });
        setRun(!run);
        console.log("RUN: ", run);
        setInput("");
        console.log("Successfully Added Message to Firebase Cloud ");
      } catch (error) {
        console.log("Send Message error: ", error);
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const fileArray = Array.from(files);
    // console.log(fileArray)
    setSelectedFiles(fileArray);
  };

  const addNewFriend = async (e) => {
    e.preventDefault();
    let get_grp_admin_email = "";

    for (let i = 0; i < roomId.length; i++) {
      if (roomId[i] == ".") {
        get_grp_admin_email += ".com";
        break;
      } else {
        get_grp_admin_email += roomId[i];
      }
    }
    console.log("get_grp_admin_email: ", get_grp_admin_email);

    if (get_grp_admin_email != email) {
      console.log("You are not admin of this group");
      return null;
    }
    console.log("Friend Email: ", input);
    // Now we have to add the new friend to the group
    const url_to_add = doc(
      collection(doc(connRef, input), "friend_grp"),
      roomId
    );
    const url = doc(collection(doc(connRef, email), "grp"), roomId);
    try {
      await setDoc(url_to_add, {
        URL: url,
      });
      console.log("Successfully Added Friend to Group");
    } catch (error) {
      console.log("Error Adding Friend to Group: ", error);
    }

    // setInput("");
  };


  const navigate = useNavigate()
  const handleJoinRoom = useCallback((roomID) => {
    navigate(`/videocall/${roomID}`)
  }, [])

  const handleJoinRoom_Recieve = useCallback((roomID) => {
    navigate(`/videocall/${roomID}`)
  }, [])



  async function videocall_func() {
    console.log("INSIDE VIDEO CALL-> ", roomId)
    randomroom = roomId
    let get_grp_admin_email = "";
    let temp_connRef;
    for (let i = 0; i < roomId.length; i++) {
      if (roomId[i] == ".") {
        get_grp_admin_email += ".com";
        break;
      } else {
        get_grp_admin_email += roomId[i];
      }
    }
    let real_email = get_grp_admin_email;
    temp_connRef = doc(
      collection(
        doc(collection(doc(connRef, email), "friend"), roomId),
        "messages"
      )
    );

    let downloadURLs = [];
    let file_name = [];
    await setDoc(temp_connRef, {
      filename: file_name,
      URL: downloadURLs,
      message: `Attention! Video: Call localhost:3000/videocall/${randomroom}`,
      email: user.email,
      name: user.displayName,
      timestamp: new Date(),
    });
    setRun(!run);
    console.log("Successfully Added Message to Firebase Cloud ");

    handleJoinRoom(roomId);

  }


  async function videorecieve_func() {

    handleJoinRoom_Recieve(user.email)  // here user is recieving
  }

  return (
    <div className={`${Style.app__chat}`}>
      <div className={`${Style.chat__header}`}>
        <div className={`w-12`}>
          <img
            src="https://media.licdn.com/dms/image/D4D03AQHVp8P-EwbdMg/profile-displayphoto-shrink_800_800/0/1695277757465?e=1705536000&v=beta&t=xlvw8jJmSwAQ8av4vo5ThCpGpH9pDEDeaZCQEkan8Ts"
            alt=""
          />
        </div>
        <div className="ml-2 flex-1">
          <h2 className="font-medium">{roomName}</h2>
          <p className="text-xs">Last seen today at 10:30 PM </p>
        </div>
        <div className="flex justify-between">

          <button className={`${Style.sidebar__btn} rounded-full`} style={{ display: isVideo ? "Block" : "none", marginTop: "0px" }} onClick={() => videocall_func()}>
            <BsFillCameraVideoFill />{" "}
          </button>

          <button className={`${Style.sidebar__btn} rounded-full`} style={{ display: isVideo ? "Block" : "none", marginTop: "0px" }} onClick={() => videorecieve_func()}>
            <BsFillCameraVideoFill />{" "}
          </button>


          <button className={`${Style.sidebar__btn} rounded-full`}>
            <BsSearch />{" "}
          </button>

          <label
            htmlFor="upload"
            className={`${Style.sidebar__btn} rounded-full`}
          >
            <IoAttachOutline />
          </label>

          {/* <button className={`${Style.sidebar__btn} rounded-full`} onClick={(e) => { }}>
						<IoAttachOutline />
					</button> */}

          <button
            className={`${Style.sidebar__btn} rounded-full`}
            onClick={() => setMenu(!menu)}
          >
            <BsThreeDotsVertical />
          </button>

          <div
            className={` top-full right-5 rounded-md overflow-hidden shadow-xl ${menu ? "flex" : "hidden"
              }`}
          >
            <button
              className={`bg-white hover:bg-[#ebebeb] w-20`}
              onClick={() => setEmailBox(!emailbox)}
            >
              &#x2795;
            </button>
            {emailbox && (
              <form action="" style={{ marginLeft: "8px" }}>
                <input
                  type="email"
                  placeholder="Enter Email"
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                />
                <button
                  className="hidden"
                  type="submit"
                  onClick={addNewFriend}
                />
              </form>
            )}

            <Link
              className={`bg-white hover:bg-[#ebebeb] w-28 py-1 flex items-center justify-center`}
              to={`groupsetting/${roomId}`}
              style={{ display: isAdmin ? "block" : "none" }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Message Fetching */}
      <div className={`${Style.chat__body}`}>
        {message.map((msg) => (
          // console.log(user.displayName),
          <div
            key={msg.data.timestamp}
            className={`${Style.chat__message} ${
              // Reciever Theme
              msg.data.name == user.displayName ? Style.chat__receiver : ""
              } `}
          >
            {msg.data.name == user.displayName ? (
              <span className={`${Style.chat__name}`}>{msg.data.name}</span>
            ) : (
              <span className={`${Style.chat__name}`}>{msg.data.name}</span>
            )}
            <p>
              {msg.data.message}
              {msg.data.URL.length > 0 &&
                msg.data.URL.map((url, index) => (
                  <div className={Style.fileDisplayContainer} key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={Style.fileLink}
                    >
                      <div className={Style.fileInfoContainer}>
                        <span className={Style.fileIcon}>
                          <FontAwesomeIcon icon={faFileAlt} />
                        </span>
                        <div className={Style.fileDetails}>
                          <span className={Style.fileName}>
                            {msg.data.filename[index]}
                          </span>
                          <span className={Style.fileActions}>
                            <FontAwesomeIcon
                              icon={faDownload}
                              className={Style.downloadIcon}
                            />
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              <span className={`${Style.chat__timestamp}`}>
                {msg.data.timestamp.toDate().toString()}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Chat Header Section */}
      <div className={`${Style.chat__footer}`}>
        <div className="">
          <button className={`${Style.footer__emoji__btn}`}>
            <BsEmojiHeartEyes />
          </button>
        </div>
        <div className={`${Style.chat__massage__box}`}>
          <form action="" className={`${Style.send__message_form}`}>
            <input
              onChange={(e) => {
                setInput(e.target.value);
              }}
              className={`${Style.send__massage__input}`}
              type="text"
              placeholder="Type a message"
            />

            <input
              className="hidden"
              id="upload"
              type="file"
              multiple
              onChange={handleFileUpload}
            />
            <button onClick={sendMessage} type="submit" className="hidden">
              Projects    Send
            </button>
          </form>
        </div>
        <div>
          <button className={`${Style.footer__emoji__btn}`}>
            <BsMic />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
