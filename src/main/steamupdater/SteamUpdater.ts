import os from 'os';
import path from 'path';
import * as fs from 'fs';
import SteamCMDManager from "./steamcmd/SteamCMDManager";
import SteamCMDManagerWin from './steamcmd/impl/SteamCMDManagerWin';
import DataFolder from '../utils/DataFolder';
import { SteamUpdaterConfig } from '../../shared/SteamUpdaterConfig';
import { SteamUpdaterMode } from '../../shared/SteamUpdaterMode';
import { ipcMain } from 'electron';
import { IPCAction } from '../../shared/IPCAction';
import { SteamGameLookupRequest } from '../../shared/SteamGameLookup';
import SteamAPIWrapper from '../utils/SteamAPIWrapper';
import LoginTestResponse, { LoginTestResult } from '../../shared/LoginTestResponse';
import { ToastType } from '../../shared/toast/ToastType';
import ServerToastMessage from '../../shared/toast/ServerToastMessage';
import SymlinkCreator from './steamcmd/SymlinkCreator';
import GenericSymlinkCreator from './steamcmd/impl/GenericSymlinkCreator';

export default class SteamUpdater {
	// Classes
	private steamcmdManager: SteamCMDManager;
	private symlinkCreator: SymlinkCreator;

	// Config and data files
	private config: SteamUpdaterConfig;
	private dataFolder: string;
	private configFile: string;

	// State
	private loginTestRunning: boolean;
	private steamcmdInstalled: boolean;

	constructor() {
		DataFolder.mkdir();
		this.dataFolder = DataFolder.get();
		this.configFile = path.join(this.dataFolder, "config.json");

		this.loginTestRunning = false;

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
					if (this.loginTestRunning) {
						this.replyWithToast(event, "Login test is already running", ToastType.ERROR);
						return;
					}
					this.loginTestRunning = true;
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
					this.loginTestRunning = false;

					const loginTestResponse: LoginTestResponse = {
						result: loginTestResult
					}
					event.reply("ipc-main", {
						action: IPCAction.BACKEND_LOGIN_REQUEST_RESULT,
						data: loginTestResponse
					});
					break;

				default:
					console.log("Unknown action on ipc-main: " + args.action);
					break;
			}
		});
	}

	private replyWithToast(event: Electron.IpcMainEvent, message: string, type: ToastType = ToastType.SUCCESS) {
		const data: ServerToastMessage = {
			message: message,
			type: type
		};

		event.reply("ipc-main", {
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

	logWarning(message) {
		console.warn(message);
	}

	logError(message) {
		console.error(message);
	}
}