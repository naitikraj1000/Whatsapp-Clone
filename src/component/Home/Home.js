import React from 'react';
import Chat from '../Chat/Chat';
import Sidebar from '../Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Style from './Home.module.scss';
import SignIn from '../SignIn/SignIn';
import Setting from '../Setting/Profilesetting';
const Home = () => {
	return (
		<div className={`grid place-items-center`}>
			<div className={`${Style.app__body} flex`}>
				<Sidebar />
				<Chat />
			</div>
		</div>
	);
}
export default Home;