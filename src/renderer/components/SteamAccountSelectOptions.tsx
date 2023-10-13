import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import SteamAccount from '../../shared/SteamAccount';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';

export default function SteamAccountSelectOptions() {
	const steamUpdater = useSteamUpdater();

	const [accounts, setAccounts] = useState<SteamAccount[]>(steamUpdater.config.accounts);
	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setAccounts(newConfig.accounts);
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		};
	}, []);

	return (
		<>
			<option value="">None</option>
			{accounts.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
		</>
	)
}
