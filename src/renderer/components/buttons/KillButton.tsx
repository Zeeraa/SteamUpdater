import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext';
import SteamUpdaterState, { State } from '../../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';

interface Props {
	className?: string;
}

export default function KillButton({ className }: Props) {
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

	function isRunning(state: SteamUpdaterState): boolean {
		switch (state.state) {
			// Seems like we cant kill the login test
			// TODO: fix this
			//case State.LOGIN_TEST_RUNNING:
			case State.UPDATING:
				return true;

			default:
				break;
		}
		return false;
	}

	function triggerKill() {
		steamUpdater.killSteamCMD();
	}

	return (
		<Button variant='danger' className={className} onClick={triggerKill} disabled={!isRunning(state)}>Kill SteamCMD</Button>
	)
}
