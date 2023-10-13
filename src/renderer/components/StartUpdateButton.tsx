import React from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../context/SteamUpdaterContext'

interface Props {
	className?: string
}

export default function StartUpdateButton({ className }: Props) {
	const steamUpdater = useSteamUpdater();

	function triggerUpdate() {
		steamUpdater.startUpdate();
	}

	return (
		<Button variant='primary' className={className} onClick={triggerUpdate}>Run update</Button>
	)
}
