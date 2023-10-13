import os from 'os';
import path from 'path';
import * as fs from 'fs-extra'
import SteamCMDManager from "./steamcmd/SteamCMDManager";
import SteamCMDManagerWin from './steamcmd/impl/SteamCMDManagerWin';
import DataFolder from '../utils/DataFolder';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { SteamUpdaterMode } from '../../shared/SteamUpdaterMode';
import { ipcMain, dialog } from 'electron';
import { IPCAction } from '../../shared/IPCAction';
import { SteamGameLookupRequest } from '../../shared/SteamGameLookup';
import SteamAPIWrapper from '../utils/SteamAPIWrapper';
import LoginTestResponse, { LoginTestResult } from '../../shared/LoginTestResponse';
import { ToastType } from '../../shared/toast/ToastType';
import ServerToastMessage from '../../shared/toast/ServerToastMessage';
import SymlinkCreator, { SymlinkType } from './steamcmd/SymlinkCreator';
import GenericSymlinkCreator from './steamcmd/impl/GenericSymlinkCreator';
import SteamappsSelectedResponse from '../../shared/SteamappsSelectedResponse';
import SteamAccount from '../../shared/SteamAccount';
import SteamCMDProcess from './steamcmd/SteamCMDProcess';
import SteamUpdaterState, { State, UpdateStatus } from '../../shared/SteamUpdaterState';
import Logger from './logger/Logger';
import DefaultLogger from './logger/impl/DefaultLogger';
import { format } from 'date-fns';
import { ConsoleColor } from '../../shared/ConsoleColor';
import { Console } from 'console';

export default class SteamUpdater {
	// Classes
	private steamcmdManager: SteamCMDManager;
	private symlinkCreator: SymlinkCreator;
	public mainWindow?: Electron.BrowserWindow;
	public _logger: DefaultLogger;

	// Config and data files
	private config: SteamUpdaterConfig;
	private dataFolder: string;
	private configFile: string;

	// State
	private _state: SteamUpdaterState;
	private loginTestRunning: boolean;
	private updateStatus: UpdateStatus | null;
	private processRunning: boolean;
	private currentSteamcmdProcess: SteamCMDProcess;
	private updateKilled: boolean;

	constructor() {
		this.mainWindow = null;
		this.currentSteamcmdProcess = null;
		this.loginTestRunning = false;
		this.updateStatus = null;
		this.updateKilled = false;
		this._state = {
			state: State.READY,
			loginTestRunning: false,
			steamappsPathError: false,
			steamcmdInstalled: true
		}

		DataFolder.mkdir();
		this.dataFolder = DataFolder.get();
		this.configFile = path.join(this.dataFolder, "config.json");

		const logFolder = path.join(this.dataFolder, "logs");
		if (!fs.existsSync(logFolder)) {
			fs.mkdirSync(logFolder);
		}

		const logFile = path.join(logFolder, `log_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.txt`);
		this._logger = new DefaultLogger(logFile, this);

		this.processRunning = false;

		if (!fs.existsSync(this.configFile)) {
			console.log("Saving default config");
			this.config = {
				accounts: [],
				games: [],
				mode: SteamUpdaterMode.MANUAL,
				scheduledUpdateTime: "00:00:00",
				shutdownOnFinish: false,
				steamPath: null
			};
			this.saveConfig();
		} else {
			console.log("Reading config");
			const configFileData = fs.readFileSync(this.configFile, 'utf-8')
			this.config = JSON.parse(configFileData) as SteamUpdaterConfig;
		}

		this.symlinkCreator = new GenericSymlinkCreator();
		if (os.platform() === 'win32') {
			this.steamcmdManager = new SteamCMDManagerWin();
		} else {
			throw new Error("Unsupported OS: " + os.platform() + " is not implemented in this version of steam updater");
		}

		ipcMain.on('ipc-main', async (event, args) => {
			console.log(args);
			switch (args.action as IPCAction) {
				case IPCAction.FONTEND_REQUEST_CONFIG:
					console.debug("Sending config to client");
					event.reply('ipc-main', {
						action: IPCAction.BACKEND_CONFIG_RESPONSE,
						data: this.getConfig()
					});
					break;

				case IPCAction.FRONTEND_FORCE_STATE_UPDATE:
					console.debug("Client forced state update");
					this.updateState();
					break;

				case IPCAction.FRONTEND_KILL_UPDATE:
					console.debug("Client is sending a kill request");
					this.kill();
					break;

				case IPCAction.FONTEND_UPDATE_CONFIG:
					console.log("Saving config");
					const newConfig = args.data as SteamUpdaterConfig;
					this.config = newConfig;
					this.saveConfig();
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_UPDATE_CONFIG_ACK
					});
					this.updateState();
					break;

				case IPCAction.FRONTEND_REQUEST_GAME_INFO:
					const gameInfoRequestData = args.data as SteamGameLookupRequest;
					console.debug("Looking up game with AppID " + gameInfoRequestData.appId);
					const gameInfoApiResponse = await SteamAPIWrapper.lookupSteamGame(gameInfoRequestData.appId);
					console.debug("Lookup completed");
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_GAME_INFO_RESPONSE,
						data: gameInfoApiResponse
					});
					break;

				case IPCAction.FRONTEND_REINSTALL_STEAMCMD:
					this.reinstallSteamCMD();
					break;

				case IPCAction.FRONTEND_BEGIN_LOGIN_TEST:
					if (this.processRunning) {
						this.logger.logError("Cant start login test because steamcmd is already running");
						this.sendToast("SteamCMD is already running", ToastType.ERROR);
						return;
					}
					this.processRunning = true;
					let loginTestResult = LoginTestResult.ERROR;
					try {
						const loginTestExitCode = await this.runLoginTest();
						if (loginTestExitCode == 0) {
							this.logger.logInfo("Login test exited with exit code zero");
							loginTestResult = LoginTestResult.OK;
						} else {
							this.logger.logWarning("Login test exited with non zero exit code");
							loginTestResult = LoginTestResult.NON_ZERO_EXIT_CODE;
						}
					} catch (err) {
						this.logger.logError("Login test failed to start due to an exception");
						loginTestResult = LoginTestResult.ERROR
					}
					this.processRunning = false;

					const loginTestResponse: LoginTestResponse = {
						result: loginTestResult
					}
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_LOGIN_REQUEST_RESULT,
						data: loginTestResponse
					});
					break;

				case IPCAction.FRONTEND_OPEN_STEAMAPPS_PICKER:
					if (this.mainWindow != null) {
						dialog.showOpenDialog(this.mainWindow, {
							title: 'Select a "steamapps" folder',
							properties: ['openDirectory'],
						}).then(result => {
							if (!result.canceled) {
								const selectedSteamappsPath = result.filePaths[0];
								const steamappsSelectedResult: SteamappsSelectedResponse = {
									path: result.filePaths[0]
								};
								event.reply("ipc-main", {
									action: IPCAction.BACKEND_STEAMAPPS_SELECTED,
									data: steamappsSelectedResult
								});
							}
						})
					}
					break;

				case IPCAction.FRONTEND_REQUEST_LOGS:
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_FULL_LOG,
						data: this._logger.messages
					});
					break;

				case IPCAction.FRONTEND_START_UPDATE:
					if (this.processRunning) {
						this.logger.logError("Cant start update because steamcmd is already running");
						this.sendToast("Cant start update because SteamCMD is already running", ToastType.ERROR);
					} else {
						try {
							await this.runUpdate();
						} catch (err) {
							this.logger.logError("Update failed");
							console.error(err);
						}
					}
					break;

				default:
					console.log("Unknown action on ipc-main: " + args.action);
					break;
			}
		});
	}

	get logger(): Logger {
		return this._logger;
	}

	get state() {
		return this._state;
	}

	private set state(state: SteamUpdaterState) {
		this._state = state;
		if (this.mainWindow != null) {
			this.mainWindow.webContents.send("ipc-main", {
				action: IPCAction.BACKEND_CURRENT_STATE,
				data: this._state
			});
		}
	}

	sendIPCAction(action: IPCAction, data: any = null) {
		if (this.mainWindow != null) {
			this.mainWindow.webContents.send("ipc-main", {
				action: action,
				data: data
			});
		}
	}

	updateState() {
		const steamcmdInstalled = this.steamcmdManager.isSteamCMDInstalled();

		let steamappsPathOk = false;
		if (this.config.steamPath != null) {
			if (fs.existsSync(this.config.steamPath)) {
				steamappsPathOk = true;
			}
		}

		let state: State = State.READY;

		let error = false;
		if (!steamcmdInstalled) {
			error = true;
		}

		if (this.loginTestRunning) {
			state = State.LOGIN_TEST_RUNNING;
		}

		if (this.updateStatus != null) {
			state = State.UPDATING;
		}

		if (!steamappsPathOk) {
			error = true;
		}

		if (error) {
			state = State.ERROR;
		}

		this.state = {
			state: state,
			steamappsPathError: !steamappsPathOk,
			steamcmdInstalled: steamcmdInstalled,
			loginTestRunning: this.loginTestRunning,
			updateStatus: this.updateStatus
		}
	}

	sendToast(message: string, type: ToastType = ToastType.SUCCESS) {
		if (this.mainWindow == null) {
			return;
		}

		const data: ServerToastMessage = {
			message: message,
			type: type
		};

		this.mainWindow.webContents.send("ipc-main", {
			action: IPCAction.BACKEND_SEND_TOAST_MESSAGE,
			data: data
		});
	}

	async init() {
		this.updateState();
		await this.checkIfSteamCMDNeedsToBeInstalled();
		this.updateState();
	}

	async reinstallSteamCMD() {
		if (this.steamcmdManager.uninstall()) {
			this.logger.logInfo("Uninstalled SteamCMD");
		}
		this.updateState();
		await this.checkIfSteamCMDNeedsToBeInstalled();
		this.updateState();
	}

	private async checkIfSteamCMDNeedsToBeInstalled() {
		if (!this.steamcmdManager.isSteamCMDInstalled()) {
			try {
				this.logger.logInfo("Installing SteamCMD...");
				await this.steamcmdManager.installSteamCMD();
				this.logger.logInfo("SteamCMD installed successfully!", ConsoleColor.GREEN);
			} catch (err) {
				console.error(err);
				this.logger.logError("Failed to install SteamCMD");
			}
		}
	}

	runUpdate(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.updateKilled = false;
			this.processRunning = true;

			let error: any = null;
			const steamcmdSteamappsPath = path.join(this.steamcmdManager.getSteamCMDFolder(), "steamapps");
			this.logger.logInfo("Steamcmd steamapps folder: " + steamcmdSteamappsPath);
			var currentSymlink: string = null;

			try {
				const games = this.config.games.filter(game => !game.disabled);

				for (let i = 0; i < games.length; i++) {
					if (this.updateKilled) {
						break;
					}

					const game = games[i];

					this.updateStatus = {
						currentIndex: i + 1,
						totalGames: games.length,
						game: game
					};
					this.updateState();

					const directory: string = game.customSteamDirectory == null ? this.config.steamPath : game.customSteamDirectory;

					this.logger.logInfo("Next game to update is " + game.displayName, ConsoleColor.GREEN);

					if (currentSymlink != directory) {
						if (currentSymlink != null) {
							this.logger.logInfo("Removing symlink " + currentSymlink + " -> " + steamcmdSteamappsPath);
							fs.rmSync(steamcmdSteamappsPath);
						}
						this.logger.logInfo("Creating a link between " + directory + " -> " + steamcmdSteamappsPath);
						if (fs.existsSync(steamcmdSteamappsPath)) {
							this.logger.logInfo("Removing steamapps folder from " + steamcmdSteamappsPath);
							fs.removeSync(steamcmdSteamappsPath);
						}
						await this.symlinkCreator.createSymlink(SymlinkType.JUNCTION, directory, steamcmdSteamappsPath);
					}

					const account: SteamAccount | null = this.config.accounts.find(a => a.id == game.accountId, null);

					let cmdLine = "+login ";

					if (account == null) {
						cmdLine += "anonymous ";
					} else {
						cmdLine += account.username + " \"" + account.password + "\" ";
					}

					cmdLine += "+app_update " + game.appId + (game.validate ? " validate" : "") + " +exit";

					this.currentSteamcmdProcess = this.steamcmdManager.runCommand(cmdLine, message => this.logger.logStdout(message), message => this.logger.logStderr(message));
					const exitCode: number = await this.currentSteamcmdProcess.getPromise();

					// When validating steamcmd seems to exit with code 1 on success so lets treat 1 as success as well if we are using validate
					if (exitCode == 0) {
						this.logger.logInfo("SteamCMD exited with code 0");
					} else if (game.validate && exitCode == 1) {
						this.logger.logInfo("SteamCMD exited with code 1 (This means validate did not report any error)");
					} else {
						this.logger.logError("SteamCMD exited with non zero exit code " + exitCode);
					}
				}
			} catch (err) {
				error = err;
				this.logger.logError("An exception occured while running update");
				console.error(err);
			}

			this.processRunning = false;
			this.updateStatus = null;
			this.updateState();

			if (currentSymlink != null) {
				this.logger.logInfo("Removing symlink " + currentSymlink + " -> " + steamcmdSteamappsPath);
				fs.rmSync(steamcmdSteamappsPath);
			}

			if (error) {
				reject(error);
			}

			resolve();
		});
	}

	kill() {
		this.updateKilled = true;
		if (this.currentSteamcmdProcess != null) {
			this.currentSteamcmdProcess.kill();
			this._logger.logInfo("SteamCMD killed", ConsoleColor.RED);
		}

	}

	runLoginTest(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.loginTestRunning = true;
			this.updateState();
			const accounts = this.config.accounts.filter(a => !a.disabled);
			let cmdLine = "";
			for (let i = 0; i < accounts.length; i++) {

			}
			accounts.forEach(account => {
				cmdLine += "+login " + account.username + " \"" + account.password + "\" +logout ";
			});
			cmdLine += "+exit";

			const process = this.steamcmdManager.runCommandWithTerminal(cmdLine);
			process.getPromise().then(exitCode => {
				this.loginTestRunning = false;
				this.updateState();
				resolve(exitCode)
			}).catch(err => {
				this.loginTestRunning = false;
				this.updateState();
				reject(err)
			});
		});
	}

	saveConfig(): void {
		fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4), 'utf-8');
	}

	getConfig(): SteamUpdaterConfig {
		return this.config;
	}
}