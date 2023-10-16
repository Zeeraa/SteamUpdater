import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSteamUpdater } from '../../context/SteamUpdaterContext';
import { Button, Col, Container, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Row } from 'react-bootstrap';
import toast from 'react-hot-toast';
import UUID from '../../../shared/utils/UUID';
import SteamAccount from '../../../shared/config/SteamAccount';
import PasswordInputGroup from '../PasswordInputGroup';

interface Props {
	visible: boolean;
	onClose: () => void;
	onAddAccount: (game: SteamAccount) => void;
}

export default function AddAccountModal({ visible, onClose, onAddAccount }: Props) {
	const steamUpdater = useSteamUpdater();

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	useEffect(() => {
		if (visible == true) {
			console.log("Clearing add account props");
			setUsername("");
			setPassword("");
		}
	}, [visible]);

	function handleUsernameChange(e: ChangeEvent<any>) {
		setUsername(e.target.value);
	}

	function handlePasswordChange(e: ChangeEvent<any>) {
		setPassword(e.target.value);
	}

	function handleAdd() {
		if (username.trim().length == 0) {
			toast.error("Invalid username");
			return;
		}

		if (username.includes(" ")) {
			toast.error("Invalid username");
			return;
		}

		if (password.trim().length == 0) {
			toast.error("Invalid password");
			return;
		}

		if (steamUpdater.config.accounts.find(a => a.username.toLocaleLowerCase() == username.toLocaleLowerCase()) != null) {
			toast.error("User already exists");
			return;
		}

		const account: SteamAccount = {
			id: UUID.v4(),
			username: username,
			password: password,
			disabled: false
		}

		onAddAccount(account);
	}

	return (
		<Modal show={visible} onHide={onClose}>
			<ModalHeader closeButton>
				<ModalTitle>Add account</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<Container fluid>
					<Row>
						<Col>
							<FormLabel>Username</FormLabel>
							<FormControl value={username} onChange={handleUsernameChange} placeholder='Username'></FormControl>
						</Col>
					</Row>

					<Row className="mt-4">
						<Col>
							<FormLabel>Password</FormLabel>
							<PasswordInputGroup value={password} onChange={handlePasswordChange} placeholder='Password' />
						</Col>
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
