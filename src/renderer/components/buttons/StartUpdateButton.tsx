import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext'
import SteamUpdaterState, { State } from '../../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';

interface Props {
	className?: string
}

export default function StartUpdateButton({ className }: Props) {
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

	function triggerUpdate() {
		steamUpdater.startUpdate();
	}

	return (
		<Button variant='primary' className={className} onClick={triggerUpdate} disabled={state.state != State.READY}>Run update</Button>
	)
}
