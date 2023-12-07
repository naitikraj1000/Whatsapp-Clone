import React from "react";
import Home from "./component/Home/Home";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import SignIn from "./component/SignIn/SignIn";
import Chat from "./component/Chat/Chat";
import RequireAuth from "./RequireAuth/RequireAuth";
import ProfileSettings from "./component/Setting/Profilesetting";
import Groupprofilesettings from "./component/Setting/Groupprofilesetting";
import LobbyScreen from "./client/screens/Lobby";
function App() {
  return (
    <div className="App">
      <h1
        className={`flex justify-center py-2 text-2xl text-white bg-[#00a884] font-serif `}
      >
        Chat App
      </h1>
      <Router>
        <RequireAuth>
          <Routes>
            <Route exact path="/" element={<Home />} >
              <Route exact path="rooms/:roomId" element={<Chat />}></Route>
            </Route>
            <Route exact path="/profilesetting" element={<ProfileSettings />} />
            <Route exact path="/groupsetting/:groupId" element={<Groupprofilesettings />} />
          </Routes>
        </RequireAuth>
        <Routes>
          <Route exact path="videocall/:videoId" element={<LobbyScreen />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
