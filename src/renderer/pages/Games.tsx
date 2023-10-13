import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import SteamGame from '../../shared/SteamGame';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import SteamGameTableEntry from '../components/SteamGameTableEntry';
import AddGameModal from '../components/modals/AddGameModal';

export default function Games() {
	const steamUpdater = useSteamUpdater();

	const [games, setGames] = useState<SteamGame[]>(steamUpdater.config.games);
	const [addGameModalVisible, setAddGameModalVisible] = useState<boolean>(false);

	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setGames(newConfig.games);
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		};
	}, []);

	function showAddGameModal() {
		setAddGameModalVisible(true);
	}

	function hideAddGameModal() {
		setAddGameModalVisible(false);
	}

	function addGame(game: SteamGame) {
		hideAddGameModal();
		const config: SteamUpdaterConfig = {...steamUpdater.config};
		config.games.push(game);
		steamUpdater.config = config;
		steamUpdater.saveConfig();
	}

	return (
		<div className='mt-2'>
			<Container fluid>
				<Row>
					<Col>
						<h3>Games</h3>
					</Col>
				</Row>

				<Row>
					<Col>
						<Table bordered striped hover>
							<thead>
								<tr>
									<th className='appid-th'>AppID</th>
									<th>Name</th>
									<th>Account</th>
									<th className="t-fit"></th>
									<th className="t-fit"></th>
									<th className="t-fit"></th>
								</tr>
							</thead>

							<tbody>
								{games.map(game => <SteamGameTableEntry key={game.id} steamGame={game} />)}
							</tbody>

							<tbody>
								<tr>
									<td colSpan={5}></td>
									<td>
										<Button className='w-100' variant='success' onClick={showAddGameModal}>Add</Button>
									</td>
								</tr>
							</tbody>
						</Table>
					</Col>
				</Row>
			</Container>
			<AddGameModal visible={addGameModalVisible} onClose={hideAddGameModal} onAddGame={addGame} />
		</div>
	)
}
