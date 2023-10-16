import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Col, Container, FormCheck, FormControl, FormLabel, FormSelect, InputGroup, Row } from 'react-bootstrap';
import { AiFillFolder, AiFillEye } from "react-icons/ai";
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { useSteamUpdater } from '../context/SteamUpdaterContext';
import { SteamUpdaterFrontendEvent } from '../script/SteamUpdaterFrontend';
import SteamappsSelectedResponse from '../../shared/dto/SteamappsSelectedResponse';
import toast from 'react-hot-toast';
import ReinstallSteamCMDButton from '../components/buttons/ReinstallSteamCMDButton';
import { SteamUpdaterMode } from '../../shared/config/SteamUpdaterMode';
import PasswordInputGroup from '../components/PasswordInputGroup';

export default function Settings() {
	const steamUpdater = useSteamUpdater();

	const [mode, setMode] = useState<string>(steamUpdater.config.mode);
	const [time, setTime] = useState<string>(steamUpdater.config.scheduledUpdateTime);
	const [shutdownOnFinish, setShutdownOnFinish] = useState<boolean>(steamUpdater.config.shutdownOnFinish);
	const [steamappsFolder, setSteamappsFolder] = useState<string>(steamUpdater.config.steamPath == null ? "" : steamUpdater.config.steamPath);

	const [discordWebhookEnabled, setDiscordWebhookEnabled] = useState<boolean>(steamUpdater.config.discordWebhookConfig.enabled);
	const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>(steamUpdater.config.discordWebhookConfig.webhook);
	const [discordWebhookPings, setDiscordWebhookPings] = useState<string>(steamUpdater.config.discordWebhookConfig.pings);
	const [discordWebhookPingForGameProgress, setDiscordWebhookPingForGameProgress] = useState<boolean>(steamUpdater.config.discordWebhookConfig.pingForGameProgress);
	const [discordWebhookShowGameProgress, setDiscordWebhookShowGameProgress] = useState<boolean>(steamUpdater.config.discordWebhookConfig.showGameProgress);

	useEffect(() => {
		const handleConfigChange = (newConfig: SteamUpdaterConfig) => {
			setSteamappsFolder(newConfig.steamPath == null ? "" : newConfig.steamPath);
			setMode(newConfig.mode);
			setShutdownOnFinish(newConfig.shutdownOnFinish);
			setDiscordWebhookEnabled(steamUpdater.config.discordWebhookConfig.enabled);
			setDiscordWebhookUrl(steamUpdater.config.discordWebhookConfig.webhook);
			setDiscordWebhookPings(steamUpdater.config.discordWebhookConfig.pings);
			setDiscordWebhookPingForGameProgress(steamUpdater.config.discordWebhookConfig.pingForGameProgress);
			setDiscordWebhookShowGameProgress(steamUpdater.config.discordWebhookConfig.showGameProgress);

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

	function handleDiscordWebhookEnabledChange(e: React.FormEvent<HTMLInputElement>) {
		setDiscordWebhookEnabled(e.currentTarget.checked);
	}

	function handleDiscordWebhookPingForGameProgressChange(e: React.FormEvent<HTMLInputElement>) {
		setDiscordWebhookPingForGameProgress(e.currentTarget.checked);
	}

	function handleDiscordWebhookShowGameProgressChange(e: React.FormEvent<HTMLInputElement>) {
		setDiscordWebhookShowGameProgress(e.currentTarget.checked);
	}


	function handleDiscordWebhookUrlChange(e: ChangeEvent<any>) {
		setDiscordWebhookUrl(e.target.value);
	}

	function handleDiscordWebhookPingsChange(e: ChangeEvent<any>) {
		setDiscordWebhookPings(e.target.value);
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
			discordWebhookConfig: {
				...steamUpdater.config.discordWebhookConfig,
				enabled: discordWebhookEnabled,
				pingForGameProgress: discordWebhookPingForGameProgress,
				pings: discordWebhookPings,
				showGameProgress: discordWebhookShowGameProgress,
				webhook: discordWebhookUrl
			},
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
						<InputGroup>
							<FormControl placeholder='steamapps directory' type='text' value={steamappsFolder} onChange={handleSteamappsFolderChange} />
							<Button variant='primary' onClick={invokeSteamappsPicker}>
								<AiFillFolder />
							</Button>
						</InputGroup>
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

				{/* Notifications */}
				<Row>
					<Col>
						<h3>Discord Webhook</h3>
					</Col>
				</Row>
				<Row>
					<Col>
						<hr />
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<FormCheck type='switch' checked={discordWebhookEnabled} onChange={handleDiscordWebhookEnabledChange} label="Enable" />
					</Col>
				</Row>

				<Row>
					<Col xs={12} md={6} className='mt-2'>
						<FormLabel>Webhook URL</FormLabel>
						<PasswordInputGroup placeholder='Webhook URL' value={discordWebhookUrl} onChange={handleDiscordWebhookUrlChange} />
					</Col>

					<Col xs={12} md={6} className='mt-2'>
						<FormLabel>Pings</FormLabel>
						<FormControl type="text" placeholder='Pings' value={discordWebhookPings} onChange={handleDiscordWebhookPingsChange} />
					</Col>
				</Row>

				<Row>
					<Col xs={12} md={6} className='mt-2'>
						<FormCheck type='switch' checked={discordWebhookShowGameProgress} onChange={handleDiscordWebhookShowGameProgressChange} label="Show game progress" />
					</Col>

					<Col xs={12} md={6} className='mt-2'>
						<FormCheck type='switch' checked={discordWebhookPingForGameProgress} onChange={handleDiscordWebhookPingForGameProgressChange} label="Ping on game progress" />
					</Col>
				</Row>

				<Row className='mt-2'>
					<Col>
						<p>
							To ping a role you have to use <code>&lt;@&12345&gt;</code> and to ping a user <code>&lt;@12345&gt;</code> with your role or user id instead
						</p>
					</Col>
				</Row>





				{/* Buttons */}
				<Row>
					<Col>
						<hr />
					</Col>
				</Row>

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
