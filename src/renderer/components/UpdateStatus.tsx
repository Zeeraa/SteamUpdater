import React, { useEffect, useState } from 'react'
import { Col, Container, ProgressBar, Ratio, Row } from 'react-bootstrap'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import SteamUpdaterState, { State } from '../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import SteamAPIGameData from '../../shared/SteamAPI/SteamAPIGameData';
import { SteamGameLookupResult } from '../../shared/SteamGameLookup';

/// @ts-ignore
import gamePlaceholderImage from "../../../assets/game_header_placeholder.png";

import "./UpdateStatus.css";

export default function UpdateStatus() {
	const steamUpdater = useSteamUpdater();
	const [steamupdaterState, setSteamupdaterState] = useState<SteamUpdaterState>(steamUpdater.state);
	const [oldAppId, setOldAppId] = useState<number>(-1);
	const [currentGameInfo, setCurrentGameInfo] = useState<SteamAPIGameData>(null);

	function checkIfShouldLookup() {
		if (steamupdaterState.state != State.UPDATING) {
			setOldAppId(-1);
			return;
		}

		if (steamupdaterState.updateStatus.game.appId != oldAppId) {
			setOldAppId(steamupdaterState.updateStatus.game.appId);
			setCurrentGameInfo(null);
			steamUpdater.triggerGameLookup(steamupdaterState.updateStatus.game.appId);
		}
	}

	useEffect(() => {
		checkIfShouldLookup();
	}, [steamupdaterState]);

	useEffect(() => {
		const handleStateChange = (newState: SteamUpdaterState) => {
			setSteamupdaterState(newState);
		}

		const handleGameData = (lookupResult: SteamGameLookupResult) => {
			if (lookupResult.success) {
				setCurrentGameInfo(lookupResult.data);
			} else {
				setCurrentGameInfo(null);
			}
		}

		steamUpdater.events.on(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
		steamUpdater.events.on(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, handleGameData);

		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
			steamUpdater.events.off(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, handleGameData);
		};
	}, []);

	function calculatePercentage(state: SteamUpdaterState): number {
		if (state.state != State.UPDATING) {
			return 0;
		}

		if (state.updateStatus.totalGames == 0) {
			return 0;
		}

		const percentage = (state.updateStatus.currentIndex / state.updateStatus.totalGames) * 100;
		return percentage;
	}

	return (
		<>
			{steamupdaterState.state == State.UPDATING &&
				<Container fluid>
					<Row>
						<Col>
							<div className='text-center'>
								<img className='update-status-game-header' src={currentGameInfo == null ? gamePlaceholderImage : currentGameInfo.header_image} />
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							<h4 className='text-center'>Updating Game <span>{steamupdaterState.updateStatus.currentIndex}</span> / <span>{steamupdaterState.updateStatus.totalGames}</span>: <span>{steamupdaterState.updateStatus.game.displayName}</span></h4>
						</Col>
					</Row>
					<Row>
						<Col>
							<ProgressBar variant="info" striped now={calculatePercentage(steamupdaterState)} label={steamupdaterState.updateStatus.currentIndex + " / " + steamupdaterState.updateStatus.totalGames} />
						</Col>
					</Row>
				</Container>
			}
		</>
	)
}
