import React, { useEffect, useState } from 'react'
import { parse } from 'date-fns';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import SteamUpdaterState from '../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import DateUtils from '../../shared/utils/DateUtils';

export default function GameTimer() {
	const steamUpdater = useSteamUpdater();

	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const interval = setInterval(() => {
			console.log(steamUpdater.state.gameUpdateStartedAt);
			const start = parse(steamUpdater.state.gameUpdateStartedAt, "yyyy-MM-dd HH:mm:ss", new Date());
			const now = new Date();

			setTimeString(DateUtils.formatDateDifference(start, now));
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [])

	return (
		<span>{timeString}</span>
	)
}