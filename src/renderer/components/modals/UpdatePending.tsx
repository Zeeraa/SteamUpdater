import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Modal, ModalBody, ModalDialog, ModalFooter, ModalHeader, ModalTitle, ProgressBar, Row } from 'react-bootstrap'
import { useSteamUpdater } from '../../context/SteamUpdaterContext';
import SteamUpdaterState from '../../../shared/SteamUpdaterState';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';


export default function UpdatePending() {
	const steamUpdater = useSteamUpdater();

	const [state, setState] = useState<SteamUpdaterState>(steamUpdater.state);

	useEffect(() => {
		const handleStateChange = (newState: SteamUpdaterState) => {
			setState(newState);
		}

		steamUpdater.events.on(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);

		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.STATE_UPDATE, handleStateChange);
		};
	}, []);

	function cancel() {
		steamUpdater.cancelAutoStart();
	}

	return (
		<>
			{state.autoStartPending &&
				<Modal show={true}>
					<ModalHeader>
						<ModalTitle>Auto update</ModalTitle>
					</ModalHeader>

					<ModalBody>
						<Container fluid>
							<Row>
								<Col>
									<h5>Auto update starting in <span>{state.autoStartTimeLeftSeconds} seconds</span></h5>
								</Col>
							</Row>
						</Container>
					</ModalBody>
					<ModalFooter>
						<Button onClick={cancel}>Cancel</Button>
					</ModalFooter>
				</Modal>
			}
		</>
	)
}
