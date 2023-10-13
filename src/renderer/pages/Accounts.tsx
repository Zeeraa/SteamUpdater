import React, { useEffect, useState } from 'react'
import { useSteamUpdater } from '../context/SteamUpdaterContext'
import { Col, Container, Row, Table } from 'react-bootstrap';
import { SteamAccountTableEntry } from '../components/SteamAccountTableEntry';

import "../table_fit.css";
import SteamAccount from '../../shared/SteamAccount';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import StartLoginTestButton from '../components/StartLoginTestButton';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import StartUpdateButton from '../components/StartUpdateButton';

export default function Accounts() {
	const steamUpdater = useSteamUpdater();

	const [accounts, setAccounts] = useState<SteamAccount[]>(steamUpdater.config.accounts);
	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setAccounts(newConfig.accounts);
		}
		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		};
	}, []);

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
						</Table>
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<StartLoginTestButton />
					</Col>
				</Row>
			</Container>
		</div>
	)
}
