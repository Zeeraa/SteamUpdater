import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext'
import SteamUpdaterState, { State } from '../../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';

interface Props {
	className?: string
}

export default function StartLoginTestButton({ className }: Props) {
	const steamUpdater = useSteamUpdater();
	const [state, setState] = useState<SteamUpdaterState>(steamUpdater.state);

	useEffect(() => {
		const handleStateChange = (state: SteamUpdaterState) => {
			setState(state);
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
		};
	}, []);

	function triggerLoginTest() {
		steamUpdater.triggerLoginTest();
	}

	function isReady() {
		if(state.loginTestRunning) {
			return false;
		}

		if(!state.steamcmdInstalled) {
			return false;
		}

		if(state.state == State.UPDATING) {
			return false;
		}

		return true;
	}

	return (
		<Button variant='info' className={className} onClick={triggerLoginTest} disabled={!isReady()}>Test logins</Button>
	)
}
