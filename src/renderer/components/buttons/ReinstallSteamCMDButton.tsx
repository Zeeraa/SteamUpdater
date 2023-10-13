import React from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext';

interface Props {
	className?: string;
}

export default function ReinstallSteamCMDButton({ className }: Props) {
	const steamUpdater = useSteamUpdater();

	function reinstall() {
		steamUpdater.reinstallSteamCMD();
	}

	return (
		<Button variant='danger' className={className} onClick={reinstall}>Reinstall SteamCMD</Button>
	)
}
