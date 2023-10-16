import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSteamUpdater } from '../../context/SteamUpdaterContext';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';
import { SteamGameLookupError, SteamGameLookupResult } from '../../../shared/dto/SteamGameLookup';
import { Button, Col, Container, FormControl, FormLabel, FormSelect, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Ratio, Row } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import SteamAccountSelectOptions from '../SteamAccountSelectOptions';
import SteamGame from '../../../shared/config/SteamGame';
import toast from 'react-hot-toast';
import UUID from '../../../shared/utils/UUID';

interface Props {
	visible: boolean;
	onClose: () => void;
	onAddGame: (game: SteamGame) => void;
}

export default function AddGameModal({ visible, onClose, onAddGame }: Props) {
	const steamUpdater = useSteamUpdater();

	const [appId, setAppId] = useState<number>(0);
	const [gameName, setGameName] = useState<string>("");
	const [gameBanner, setGameBanner] = useState<string | null>(null);
	const [selectedAccount, setSelectedAccount] = useState<string>(null);

	useEffect(() => {
		const handleGameResponse = (result: SteamGameLookupResult) => {
			if (result.success) {
				setAppId(result.appId);
				setGameName(result.data.name);
				setGameBanner(result.data.header_image);
			} else {
				switch (result.error) {
					case SteamGameLookupError.NETWORK_ERROR:
						toast.error("Failed to fetch data from steam api");
						break;

					case SteamGameLookupError.NOT_FOUND:
						toast.error("Could not find game with AppID: " + result.appId);
						break;

					default:
						toast.error("Unknown error");
						break;
				}
				setGameBanner(null);
			}
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, handleGameResponse);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, handleGameResponse);
		};
	}, []);

	useEffect(() => {
		if (visible == true) {
			console.log("Clearing add game props");
			setAppId(0);
			setGameName("");
			setGameBanner(null);
			setSelectedAccount("");
		}
	}, [visible]);

	function handleAppIdChange(e: ChangeEvent<any>) {
		setGameBanner(null);
		setAppId(e.target.value);
	}

	function handleGameNameChange(e: ChangeEvent<any>) {
		setGameName(e.target.value);
	}

	function handleSelectedAccountChange(e: React.FormEvent<HTMLSelectElement>) {
		setSelectedAccount((e.target as HTMLSelectElement).value);
	}

	function searchForAppId() {
		console.log("Trigger search for " + appId);
		setGameBanner(null);
		steamUpdater.triggerGameLookup(appId);
	}

	function handleAdd() {
		if (appId <= 0) {
			toast.error("Invalid AppID");
			return;
		}

		if (gameName.trim().length == 0) {
			toast.error("Please enter a name of the game");
			return;
		}

		const account = selectedAccount.trim().length == 0 ? null : selectedAccount;

		const game: SteamGame = {
			appId: appId,
			displayName: gameName,
			disabled: false,
			validate: true,
			accountId: account,
			thumbnail: gameBanner,
			id: UUID.v4()
		}

		onAddGame(game);
	}

	return (
		<Modal show={visible} onHide={onClose}>
			<ModalHeader closeButton>
				<ModalTitle>Add game</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<Container fluid>
					<Row>
						<Col>
							<FormLabel>AppID</FormLabel>
							<InputGroup>
								<FormControl value={appId} onChange={handleAppIdChange} type='number' min={0} placeholder='AppID' />
								<Button type="button" onClick={searchForAppId}>
									<BsSearch />
								</Button>
							</InputGroup>
						</Col>
					</Row>

					<Row className="mt-2">
						<Col>
							<FormLabel>Game Name</FormLabel>
							<FormControl type='text' placeholder='Game Name' value={gameName} onChange={handleGameNameChange} />
						</Col>
					</Row>

					<Row className="mt-2">
						<Col>
							<FormLabel>Account</FormLabel>
							<FormSelect value={selectedAccount} onChange={handleSelectedAccountChange}>
								<SteamAccountSelectOptions />
							</FormSelect>
						</Col>
					</Row>

					<Row className="mt-2 mx-1">
						{gameBanner && <Ratio aspectRatio="16x9">
							<img src={gameBanner} />
						</Ratio>}
					</Row>
				</Container>
			</ModalBody>
			<ModalFooter>
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="success" onClick={handleAdd}>
					Add
				</Button>
			</ModalFooter>
		</Modal>
	)
}
