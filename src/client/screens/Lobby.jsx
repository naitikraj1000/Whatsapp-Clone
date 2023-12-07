import React from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
const LobbyScreen = () => {
  const [user] = useAuthState(auth);
  const { videoId } = useParams();
  const myMeeting = async (element) => {
    const appID = 1327908371;
    const serverSecret = "d7e8eca72d777a63f5c32b9b1301b3d8";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      videoId,
      user.uid,
      user.email
    );
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
    });
  };

  return (
    <>
      {/* <h1> Chat Video: call with Video ID {videoId} </h1> */}

      <div ref={myMeeting} />
    </>
  );
};

export default LobbyScreen;
