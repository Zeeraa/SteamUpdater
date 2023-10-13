import React, { useState } from 'react'
import SteamGame from '../../shared/SteamGame'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { Button, FormCheck, FormSelect, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import SteamAccountSelectOptions from './SteamAccountSelectOptions';

/// @ts-ignore
import noBackgroundImage from "../../../assets/null.png";

import "./SteamGameTableEntry.css";

interface Props {
	steamGame: SteamGame
}

export default function SteamGameTableEntry({ steamGame }: Props) {
	const steamUpdater = useSteamUpdater();
	const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

	function closeDeleteModal() {
		setDeleteModalVisible(false);
	}

	function showDeleteModal() {
		setDeleteModalVisible(true);
	}

	function deleteAccount() {
		steamUpdater.config = {
			...steamUpdater.config,
			games: steamUpdater.config.games.filter((game: SteamGame) => game.id != steamGame.id)
		}
		closeDeleteModal();
		steamUpdater.saveConfig();
	}

	function handleSetEnabled(e: React.FormEvent<HTMLInputElement>) {
		steamUpdater.config = {
			...steamUpdater.config,
			games: steamUpdater.config.games.map((game: SteamGame) =>
				game.id === steamGame.id
					? { ...game, disabled: !e.currentTarget.checked }
					: game
			)
		}
		steamUpdater.saveConfig();
	}

	function handleSetValidate(e: React.FormEvent<HTMLInputElement>) {
		steamUpdater.config = {
			...steamUpdater.config,
			games: steamUpdater.config.games.map((game: SteamGame) =>
				game.id === steamGame.id
					? { ...game, validate: e.currentTarget.checked }
					: game
			)
		}
		steamUpdater.saveConfig();
	}

	function handleAccountChange(e: React.FormEvent<HTMLSelectElement>) {
		let newAccount = (e.target as HTMLSelectElement).value;
		if (newAccount.trim().length == 0) {
			newAccount = null;
		}

		steamUpdater.config = {
			...steamUpdater.config,
			games: steamUpdater.config.games.map((game: SteamGame) =>
				game.id === steamGame.id
					? { ...game, accountId: newAccount }
					: game
			)
		}
		steamUpdater.saveConfig();
	}

	return (
		<>
			<tr>
				<td className='steam-game-appid-field' style={{ backgroundImage: 'url("' + (steamGame.thumbnail == null ? noBackgroundImage : steamGame.thumbnail) + '")' }}>
					<span className='appid-inner'>
						<span>{steamGame.appId}</span>
					</span>
				</td>
				<td>{steamGame.displayName}</td>
				<td>
					<FormSelect onChange={handleAccountChange} value={steamGame.accountId == null ? "" : steamGame.accountId}>
						<SteamAccountSelectOptions />
					</FormSelect>
				</td>
				<td className="t-fit">
					<FormCheck type='switch' checked={steamGame.validate} onChange={handleSetValidate} label="Validate" />
				</td>
				<td className="t-fit">
					<FormCheck type='switch' checked={!steamGame.disabled} onChange={handleSetEnabled} label="Enable" />
				</td>
				<td className="t-fit">
					<Button variant='danger' onClick={showDeleteModal}>Remove</Button>
				</td>
			</tr>

			<Modal show={deleteModalVisible} onHide={closeDeleteModal}>
				<ModalHeader closeButton>
					<ModalTitle>Delete game</ModalTitle>
				</ModalHeader>
				<ModalBody>Please confirm that you want to remove the game <span>{steamGame.appId}</span> <span>{steamGame.displayName}</span></ModalBody>
				<ModalFooter>
					<Button variant="secondary" onClick={closeDeleteModal}>
						Cancel
					</Button>
					<Button variant="danger" onClick={deleteAccount}>
						Delete
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
