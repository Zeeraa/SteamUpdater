import React, { useEffect, useState } from 'react'
import { Col, Container, Modal, ModalBody, ModalDialog, ModalFooter, ModalHeader, ModalTitle, ProgressBar, Row } from 'react-bootstrap'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import SteamUpdaterState, { State } from '../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import SteamAPIGameData from '../../shared/SteamAPI/SteamAPIGameData';
import { SteamGameLookupResult } from '../../shared/SteamGameLookup';

/// @ts-ignore
import gamePlaceholderImage from "../../../assets/game_header_placeholder.png";

import "./UpdateStatus.css";
import KillButton from './buttons/KillButton';
import LogOutput from './log/LogOutput';
import UpdateTimer from './UpdateTimer';
import GameTimer from './GameTimer';

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
				<Modal show={true} fullscreen>
					<ModalHeader>
						<ModalTitle>Updating Games <span>{steamupdaterState.updateStatus.currentIndex}</span> / <span>{steamupdaterState.updateStatus.totalGames}</span></ModalTitle>
					</ModalHeader>

					<ModalBody>
						<Container fluid>
							<Row>
								<Col>
									<div className='text-center'>
										<img className='update-status-game-header' src={currentGameInfo == null ? gamePlaceholderImage : currentGameInfo.header_image} />
									</div>
								</Col>
							</Row>
							<Row className="mt-1">
								<Col>
									<h4 className='text-center'>Updating Game <span>{steamupdaterState.updateStatus.currentIndex}</span> / <span>{steamupdaterState.updateStatus.totalGames}</span>: <span>{steamupdaterState.updateStatus.game.displayName}</span></h4>
								</Col>
							</Row>
							<Row className="mt-1">
								<Col>
									<ProgressBar variant="info" striped now={calculatePercentage(steamupdaterState)} label={steamupdaterState.updateStatus.currentIndex + " / " + steamupdaterState.updateStatus.totalGames} />
								</Col>
							</Row>
							<Row className="mt-1">
								<span>Total time elapsed: <UpdateTimer /></span><br />
								<span>Time elapsed for {steamupdaterState.updateStatus.game.displayName}: <GameTimer /></span>
							</Row>
							<Row className="mt-1">
								<div className='mx-2 px-2 mt-2'>
									<LogOutput />
								</div>
							</Row>
						</Container>
					</ModalBody>
					<ModalFooter>
						<KillButton />
					</ModalFooter>
				</Modal>
			}
		</>
	)
}
