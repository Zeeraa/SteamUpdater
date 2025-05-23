import React, { useEffect, useState } from 'react'
import { parse } from 'date-fns';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import DateUtils from '../../shared/utils/DateUtils';

export default function GameTimer() {
	const steamUpdater = useSteamUpdater();

	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const interval = setInterval(() => {
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