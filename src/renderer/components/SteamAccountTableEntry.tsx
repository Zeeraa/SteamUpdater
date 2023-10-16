import React, { ChangeEvent, ChangeEventHandler, useState } from 'react'
import SteamAccount from '../../shared/config/SteamAccount'
import { Button, Col, Container, FormCheck, FormControl, FormLabel, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Row } from 'react-bootstrap'
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import HiddenPasswordSpan from './password/HiddenPasswordSpan';
import toast from 'react-hot-toast';
import "../table_fit.css";
import PasswordInputGroup from './PasswordInputGroup';

interface Props {
	steamAccount: SteamAccount
}

export function SteamAccountTableEntry({ steamAccount }: Props) {
	const steamUpdater = useSteamUpdater();

	const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

	const [editUsername, setEditUsername] = useState<string>("");
	const [editPassword, setEditPassword] = useState<string>("");
	const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

	function closeDeleteModal() {
		setDeleteModalVisible(false);
	}

	function showDeleteModal() {
		setDeleteModalVisible(true);
	}

	function deleteAccount() {
		steamUpdater.config = {
			...steamUpdater.config,
			accounts: steamUpdater.config.accounts.filter(a => a.id != steamAccount.id)
		}
		closeDeleteModal();
		steamUpdater.saveConfig();
	}

	function showEditModal() {
		setEditUsername(steamAccount.username);
		setEditPassword(steamAccount.password);
		setEditModalVisible(true);
	}

	function closeEditModal() {
		setEditModalVisible(false);
	}

	function handleEditSave() {
		if (editUsername.trim().length == 0) {
			toast.error("Username cant be empty");
			return;
		}

		if (steamUpdater.config.accounts.filter((account => account.id != steamAccount.id && account.username.toLowerCase() == editUsername.trim().toLowerCase())).length > 0) {
			toast.error("An account with that username has already been added");
			return;
		}

		closeEditModal();

		steamUpdater.config = {
			...steamUpdater.config,
			accounts: steamUpdater.config.accounts.map((account: SteamAccount) =>
				account.id === account.id
					? { ...account, username: editUsername.trim(), password: editPassword }
					: account
			)
		}
		steamUpdater.saveConfig();
	}

	function handleUsernameChange(e: ChangeEvent<any>) {
		setEditUsername(e.target.value);
	}

	function handlePasswordChange(e: ChangeEvent<any>) {
		setEditPassword(e.target.value);
	}

	function handleSetEnabled(e: React.FormEvent<HTMLInputElement>) {
		steamUpdater.config = {
			...steamUpdater.config,
			accounts: steamUpdater.config.accounts.map(account =>
				account.id === steamAccount.id
					? { ...account, disabled: !e.currentTarget.checked }
					: account
			)
		}
		steamUpdater.saveConfig();
	}

	return (
		<>
			<tr>
				<td>{steamAccount.username}</td>
				<td>
					<HiddenPasswordSpan password={steamAccount.password} />
				</td>
				<td className="t-fit">
					<FormCheck type='switch' checked={!steamAccount.disabled} onChange={handleSetEnabled} label="Enable" />
				</td>
				<td className="t-fit">
					<Button variant='info' onClick={showEditModal}>Edit</Button>
				</td>
				<td className="t-fit">
					<Button variant='danger' onClick={showDeleteModal}>Remove</Button>
				</td>
			</tr>

			<Modal show={deleteModalVisible} onHide={closeDeleteModal}>
				<ModalHeader closeButton>
					<ModalTitle>Delete account</ModalTitle>
				</ModalHeader>
				<ModalBody>Please confirm that you want to remove the account with username <span>{steamAccount.username}</span></ModalBody>
				<ModalFooter>
					<Button variant="secondary" onClick={closeDeleteModal}>
						Cancel
					</Button>
					<Button variant="danger" onClick={deleteAccount}>
						Delete
					</Button>
				</ModalFooter>
			</Modal>

			<Modal show={editModalVisible} onHide={closeEditModal}>
				<ModalHeader closeButton>
					<ModalTitle>Edit account <span>{steamAccount.username}</span></ModalTitle>
				</ModalHeader>
				<ModalBody>
					<Container>
						<Row>
							<Col>
								<FormLabel>Username</FormLabel>
							</Col>
						</Row>

						<Row>
							<Col>
								<FormControl value={editUsername} onChange={handleUsernameChange} placeholder='Username' type='text' />
							</Col>
						</Row>

						<Row className='mt-2'>
							<Col>
								<FormLabel>Password</FormLabel>
							</Col>
						</Row>

						<Row>
							<Col>
								<PasswordInputGroup value={editPassword} onChange={handlePasswordChange} placeholder='Password' />
							</Col>
						</Row>
					</Container>
				</ModalBody>
				<ModalFooter>
					<Button variant="secondary" onClick={closeEditModal}>
						Cancel
					</Button>
					<Button variant="info" onClick={handleEditSave}>
						Save
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}