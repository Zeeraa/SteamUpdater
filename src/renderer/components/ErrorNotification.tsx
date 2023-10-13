import React, { useEffect, useState } from 'react'
import SteamUpdaterState, { State } from '../../shared/SteamUpdaterState';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import { Alert } from 'react-bootstrap';

export default function ErrorNotification() {
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

	return (
		<>
			{state.state == State.ERROR && <>
				<Alert variant='danger' className="mx-1 my-2">
					Errors detected:&nbsp;
					{state.steamappsPathError && <span>SteamApps path not set.&nbsp;</span>}
					{!state.steamcmdInstalled && <span>SteamCMD Not installed.&nbsp;</span>}
				</Alert>
			</>}
		</>
	)
}
