import React from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext'

interface Props {
	className?: string
}

export default function StartLoginTestButton({ className }: Props) {
	const steamUpdater = useSteamUpdater();

	function triggerLoginTest() {
		steamUpdater.triggerLoginTest();
	}

	return (
		<Button variant='info' className={className} onClick={triggerLoginTest}>Test logins</Button>
	)
}
