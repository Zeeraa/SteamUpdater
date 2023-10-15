import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Col, Container, FormCheck, FormControl, FormLabel, FormSelect, Row } from 'react-bootstrap';
import { AiFillFolder } from "react-icons/ai";
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import SteamappsSelectedResponse from '../../shared/SteamappsSelectedResponse';
import toast from 'react-hot-toast';
import ReinstallSteamCMDButton from '../components/buttons/ReinstallSteamCMDButton';
import { config } from 'process';
import { SteamUpdaterMode } from '../../shared/SteamUpdaterMode';

export default function Settings() {
	const steamUpdater = useSteamUpdater();

	const [mode, setMode] = useState<string>(steamUpdater.config.mode);
	const [time, setTime] = useState<string>(steamUpdater.config.scheduledUpdateTime);
	const [shutdownOnFinish, setShutdownOnFinish] = useState<boolean>(steamUpdater.config.shutdownOnFinish);
	const [steamappsFolder, setSteamappsFolder] = useState<string>(steamUpdater.config.steamPath == null ? "" : steamUpdater.config.steamPath);

	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setSteamappsFolder(newConfig.steamPath == null ? "" : newConfig.steamPath);
			setMode(newConfig.mode);
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

	function handleModeChange(e: ChangeEvent<any>) {
		setMode(e.target.value);
	}

	function handleTimeChange(e: ChangeEvent<any>) {
		setTime(e.target.value);
	}

	function handleShutdownChange(e: React.FormEvent<HTMLInputElement>) {
		setShutdownOnFinish(e.currentTarget.checked);
	}

	function save() {
		const steamappsPath = steamappsFolder.trim().length == 0 ? null : steamappsFolder;

		steamUpdater.config = {
			...steamUpdater.config,
			steamPath: steamappsPath,
			mode: mode as SteamUpdaterMode,
			scheduledUpdateTime: time,
			shutdownOnFinish: shutdownOnFinish
		}
		steamUpdater.saveConfig();
	}

	return (
		<>
			<Container fluid>
				<Row>
					<Col>
						<h3>Settings</h3>
					</Col>
				</Row>

				{/* SteamCMD path settings */}
				<Row className='mt-2'>
					<Col xs={12}>
						<FormLabel>steamapps directory</FormLabel>
					</Col>
					<Col xs={9}>
						<FormControl placeholder='steamapps directory' type='text' value={steamappsFolder} onChange={handleSteamappsFolderChange} />
					</Col>
					<Col xs={3}>
						<Button variant='primary' className='w-100' onClick={invokeSteamappsPicker}>
							<AiFillFolder />
						</Button>
					</Col>
				</Row>

				{/* Mode and time */}
				<Row className='mt-2'>
					<Col xs={12} md={6}>
						<FormLabel>Mode</FormLabel>
						<FormSelect value={mode} onChange={handleModeChange}>
							<option value={SteamUpdaterMode.MANUAL}>Manual mode</option>
							<option value={SteamUpdaterMode.AUTO}>Auto start</option>
							<option value={SteamUpdaterMode.SCHEDULED}>Scheduled mode</option>
						</FormSelect>
					</Col>

					<Col xs={12} md={6}>
						<FormLabel>Auto update time</FormLabel>
						<FormControl type="time" step="1" value={time} onChange={handleTimeChange} disabled={mode != SteamUpdaterMode.SCHEDULED} />
					</Col>
				</Row>

				{/* Shutdown settings */}
				<Row className='mt-2'>
					<Col>
						<FormCheck type='switch' checked={shutdownOnFinish} onChange={handleShutdownChange} label="Shutdown on finish" />
					</Col>
				</Row>

				{/* Buttons */}
				<Row className='mt-2'>
					<Col xs={12} md={6}>
						<Button variant='success' onClick={save} className='w-100 mt-2'>Save</Button>
					</Col>
					<Col xs={12} md={6}>
						<ReinstallSteamCMDButton className='w-100 mt-2' />
					</Col>
				</Row>
			</Container>
		</>
	)
}
