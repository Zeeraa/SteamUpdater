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

export default class SteamUpdater {
	// Classes
	private steamcmdManager: SteamCMDManager;
	private symlinkCreator: SymlinkCreator;
	public mainWindow?: Electron.BrowserWindow;

	// Config and data files
	private config: SteamUpdaterConfig;
	private dataFolder: string;
	private configFile: string;

	// State
	private processRunning: boolean;
	private steamcmdInstalled: boolean;
	private currentSteamcmdProcess: SteamCMDProcess;

	constructor() {
		this.mainWindow = null;
		this.currentSteamcmdProcess = null;

		DataFolder.mkdir();
		this.dataFolder = DataFolder.get();
		this.configFile = path.join(this.dataFolder, "config.json");

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

		this.steamcmdInstalled = false;
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

				case IPCAction.FONTEND_UPDATE_CONFIG:
					console.log("Saving config");
					const newConfig = args.data as SteamUpdaterConfig;
					this.config = newConfig;
					this.saveConfig();
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_UPDATE_CONFIG_ACK
					});
					break;

				case IPCAction.FRONTEND_REQUEST_GAME_INFO:
					const gameInfoRequestData = args.data as SteamGameLookupRequest;
					const gameInfoApiResponse = await SteamAPIWrapper.lookupSteamGame(gameInfoRequestData.appId);
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_GAME_INFO_RESPONSE,
						data: gameInfoApiResponse
					});
					break;

				case IPCAction.FRONTEND_BEGIN_LOGIN_TEST:
					if (this.processRunning) {
						this.logError("Cant start login test because steamcmd is already running");
						this.sendToast("SteamCMD is already running", ToastType.ERROR);
						return;
					}
					this.processRunning = true;
					let loginTestResult = LoginTestResult.ERROR;
					try {
						const loginTestExitCode = await this.runLoginTest();
						if (loginTestExitCode == 0) {
							this.logInfo("Login test exited with exit code zero");
							loginTestResult = LoginTestResult.OK;
						} else {
							this.logWarning("Login test exited with non zero exit code");
							loginTestResult = LoginTestResult.NON_ZERO_EXIT_CODE;
						}
					} catch (err) {
						this.logError("Login test failed to start due to an exception");
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

				case IPCAction.FRONTEND_START_UPDATE:
					if (this.processRunning) {
						this.logError("Cant start update because steamcmd is already running");
						this.sendToast("Cant start update because SteamCMD is already running", ToastType.ERROR);
					} else {
						try {
							await this.runUpdate();
						} catch (err) {
							this.logError("Update failed");
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
		if (!this.steamcmdManager.isSteamCMDInstalled()) {
			try {
				await this.steamcmdManager.installSteamCMD();
				this.steamcmdInstalled = true;
			} catch (err) {
				console.error(err);
				this.logError("Failed to install SteamCMD");
			}
		} else {
			this.steamcmdInstalled = true;
		}
	}

	runUpdate(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.processRunning = true;

			let error: any = null;
			const steamcmdSteamappsPath = path.join(this.steamcmdManager.getSteamCMDFolder(), "steamapps");
			this.logInfo("Steamcmd steamapps folder: " + steamcmdSteamappsPath);
			var currentSymlink: string = null;

			try {
				const games = this.config.games.filter(game => !game.disabled);

				for (let i = 0; i < games.length; i++) {
					const game = games[i];
					const directory: string = game.customSteamDirectory == null ? this.config.steamPath : game.customSteamDirectory;

					this.logInfo("Next game to update is " + game.displayName);

					if (currentSymlink != directory) {
						if (currentSymlink != null) {
							this.logInfo("Removing symlink " + currentSymlink + " -> " + steamcmdSteamappsPath);
							fs.rmSync(steamcmdSteamappsPath);
						}
						this.logInfo("Creating a link between " + directory + " -> " + steamcmdSteamappsPath);
						if(fs.existsSync(steamcmdSteamappsPath)) {
							this.logInfo("Removing steamapps folder from " + steamcmdSteamappsPath);
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

					cmdLine += "+app_update " + game.appId + " +exit";

					this.currentSteamcmdProcess = this.steamcmdManager.runCommand(cmdLine, this.logSteamcmdMessage, this.logSteamcmdError);
					const exitCode: number = await this.currentSteamcmdProcess.getPromise();

					if (exitCode == 0) {
						this.logInfo("SteamCMD exited with code 0");
					} else {
						this.logError("SteamCMD exited with non zero exit code " + exitCode);
					}
				}
			} catch (err) {
				error = err;
				this.logError("An exception occured while running update");
				console.error(err);
			}

			this.processRunning = false;

			if (currentSymlink != null) {
				this.logInfo("Removing symlink " + currentSymlink + " -> " + steamcmdSteamappsPath);
				fs.rmSync(steamcmdSteamappsPath);
			}

			if (error) {
				reject(error);
			}

			resolve();
		});
	}

	runLoginTest(): Promise<number> {
		return new Promise((resolve, reject) => {
			const accounts = this.config.accounts.filter(a => !a.disabled);
			let cmdLine = "";
			accounts.forEach(account => {
				cmdLine += "+login " + account.username + " \"" + account.password + "\" +logout ";
			});
			cmdLine += "+exit";

			const process = this.steamcmdManager.runCommandWithTerminal(cmdLine);
			process.getPromise().then(exitCode => resolve(exitCode)).catch(err => reject(err));

		});
	}

	saveConfig(): void {
		fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4), 'utf-8');
	}

	getConfig(): SteamUpdaterConfig {
		return this.config;
	}

	logInfo(message) {
		console.log(message);
	}

	logSteamcmdMessage(message) {
		console.log("[SteamCMD:STDOUT] " + message);
	}

	logSteamcmdError(message) {
		console.error("[SteamCMD:STDERR] " + message);
	}

	logWarning(message) {
		console.warn(message);
	}

	logError(message) {
		console.error(message);
	}
}