import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import StartUpdateButton from '../components/StartUpdateButton'
import StartLoginTestButton from '../components/StartLoginTestButton'

export default function Main() {
	return (
		<>
			<Container >
				<Row>
					<Col className='mt-2'>
						<StartUpdateButton className='mx-1' />
						<StartLoginTestButton className='mx-1' />
					</Col>
				</Row>
			</Container>
		</>
	)
}
