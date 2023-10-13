import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Col, Container, FormControl, FormLabel, Row } from 'react-bootstrap';
import { AiFillFolder } from "react-icons/ai";
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import SteamappsSelectedResponse from '../../shared/SteamappsSelectedResponse';
import toast from 'react-hot-toast';

export default function Settings() {
	const steamUpdater = useSteamUpdater();

	const [steamappsFolder, setSteamappsFolder] = useState<string>("");

	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setSteamappsFolder(newConfig.steamPath == null ? "" : newConfig.steamPath);
		}

		const handleConfigSaved = () => {
			console.log("Showing config saved message");
			toast.success("Config saved");
		}

		const handleSteamappsPick = (result: SteamappsSelectedResponse) => {
			setSteamappsFolder(result.path);
		}

		setSteamappsFolder(steamUpdater.config.steamPath == null ? "" : steamUpdater.config.steamPath);

		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
		steamUpdater.events.on(SteamUpdaterFrontendEvent.CONFIG_SAVED, handleConfigSaved);
		steamUpdater.events.on(SteamUpdaterFrontendEvent.STEAMAPPS_FOLDER_SELECTED, handleSteamappsPick);
		return () => {
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_CHANGED, handleConfigChange);
			steamUpdater.events.off(SteamUpdaterFrontendEvent.CONFIG_SAVED, handleConfigSaved);
			steamUpdater.events.off(SteamUpdaterFrontendEvent.STEAMAPPS_FOLDER_SELECTED, handleSteamappsPick);
		};
	}, []);

	function invokeSteamappsPicker() {
		steamUpdater.invokeSteamappsPicker();
	}

	function handleSteamappsFolderChange(e: ChangeEvent<any>) {
		setSteamappsFolder(e.target.value);
	}

	function save() {
		const steamappsPath = steamappsFolder.trim().length == 0 ? null : steamappsFolder;

		steamUpdater.config = {
			...steamUpdater.config,
			steamPath: steamappsPath
		}
		steamUpdater.saveConfig();
	}

	return (
		<>
			<Container fluid>
				<Row>
					<Col>
						<h3>Games</h3>
					</Col>
				</Row>

				<Row>
					<Col>
						<FormLabel>steamapps directory</FormLabel>
					</Col>
				</Row>
				<Row>
					<Col xs={11}>
						<FormControl placeholder='steamapps directory' type='text' value={steamappsFolder} onChange={handleSteamappsFolderChange} />
					</Col>
					<Col xs={1}>
						<Button variant='primary' onClick={invokeSteamappsPicker}>
							<AiFillFolder />
						</Button>
					</Col>
				</Row>
				<Row>
					<Col>
						<Button variant='success' onClick={save}>Save</Button>
					</Col>
				</Row>
			</Container>
		</>
	)
}
