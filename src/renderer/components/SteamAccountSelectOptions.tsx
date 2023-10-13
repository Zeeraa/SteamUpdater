import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import SteamAccount from '../../shared/SteamAccount';

export default function SteamAccountSelectOptions() {
	const steamUpdater = useSteamUpdater();

	const [accounts, setAccounts] = useState<SteamAccount[]>(steamUpdater.config.accounts);
	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setAccounts(newConfig.accounts);
		}
		steamUpdater.events.on('configChanged', handleConfigChange);
		return () => {
			steamUpdater.events.off('configChanged', handleConfigChange);
		};
	}, []);

	return (
		<>
			<option value="">None</option>
			{accounts.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
		</>
	)
}
