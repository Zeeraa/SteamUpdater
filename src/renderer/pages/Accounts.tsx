import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext'
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { SteamAccountTableEntry } from '../components/SteamAccountTableEntry';

import "../table_fit.css";
import SteamAccount from '../../shared/config/SteamAccount';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import StartLoginTestButton from '../components/buttons/StartLoginTestButton';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import KillButton from '../components/buttons/KillButton';
import AddAccountModal from '../components/modals/AddAccountModal';

export default function Accounts() {
	const steamUpdater = useSteamUpdater();

	const [accounts, setAccounts] = useState<SteamAccount[]>(steamUpdater.config.accounts);
	const [addAccountVisible, setAddAccountVisible] = useState<boolean>(false);

	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setAccounts(newConfig.accounts);
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		};
	}, []);

	function showAddAccountModal() {
		setAddAccountVisible(true);
	}

	function hideAddAccountModal() {
		setAddAccountVisible(false);
	}

	function addAccount(acccount: SteamAccount) {
		hideAddAccountModal();
		const config: SteamUpdaterConfig = {...steamUpdater.config};
		config.accounts.push(acccount);
		steamUpdater.config = config;
		steamUpdater.saveConfig();
	}

	return (
		<div className='mt-2'>
			<Container fluid>
				<Row>
					<Col>
						<h3>Accounts</h3>
					</Col>
				</Row>

				<Row>
					<Col>
						<Table bordered striped hover>
							<thead>
								<tr>
									<th>Username</th>
									<th>Password</th>
									<th className="t-fit"></th>
									<th className="t-fit"></th>
									<th className="t-fit"></th>
								</tr>
							</thead>

							<tbody>
								{accounts.map(account => <SteamAccountTableEntry key={account.id} steamAccount={account} />)}
							</tbody>

							<tbody>
								<tr>
									<td colSpan={4}></td>
									<td>
										<Button className='w-100' variant='success' onClick={showAddAccountModal}>Add</Button>
									</td>
								</tr>
							</tbody>
						</Table>
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<StartLoginTestButton className='xm-1 mt-1' />
						<KillButton className='mx-1 mt-1' />
					</Col>
				</Row>
			</Container>

			<AddAccountModal visible={addAccountVisible} onClose={hideAddAccountModal} onAddAccount={addAccount} />
		</div>
	)
}
