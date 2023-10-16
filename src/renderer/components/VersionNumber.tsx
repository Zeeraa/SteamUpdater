import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext'
import SteamUpdaterState from '../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';

export default function VersionNumber() {
	const steamUpdater = useSteamUpdater();

	const [version, setVersion] = useState<string>(steamUpdater.state.version);

	useEffect(() => {
		const handleStateChange = (newState: SteamUpdaterState) => {
			setVersion(newState.version);
		}

		steamUpdater.events.on(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);

		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
		};
	}, []);

	return (
		<span>{version}</span>
	)
}
