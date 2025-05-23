import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import StartUpdateButton from '../components/buttons/StartUpdateButton'
import StartLoginTestButton from '../components/buttons/StartLoginTestButton'
import LogOutput from '../components/log/LogOutput'
import KillButton from '../components/buttons/KillButton'
import VersionNumber from '../components/VersionNumber'

export default function Main() {
	return (
		<>
			<Container>
				<Row>
					<Col className='mt-2'>
						<StartUpdateButton className='mx-1 mt-1' />
						<StartLoginTestButton className='mx-1 mt-1' />
						<KillButton className='mx-1 mt-1' />
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<LogOutput className='mt-2' />
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<span>Version: <code><VersionNumber /></code></span>
					</Col>
				</Row>


			</Container>
		</>
	)
}
