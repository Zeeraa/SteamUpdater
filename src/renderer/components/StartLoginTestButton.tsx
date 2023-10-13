import React from 'react'
import { Button } from 'react-bootstrap'
import { useSteamUpdater } from '../context/SteamUpdaterContext'

export default function StartLoginTestButton() {
	const steamUpdater = useSteamUpdater();

	function triggerLoginTest() {
		steamUpdater.triggerLoginTest();
	}

	return (
		<Button variant='info' onClick={triggerLoginTest}>Test logins</Button>
	)
}
