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

export default class SteamUpdater {
	// Classes
	private steamcmdManager: SteamCMDManager;
	
	// Config and data files
	private config: SteamUpdaterConfig;
	private dataFolder: string;
	private configFile: string;

	// State
	private steamcmdInstalled: boolean;

	constructor() {
		DataFolder.mkdir();
		this.dataFolder = DataFolder.get();
		this.configFile = path.join(this.dataFolder, "config.json");

		if(!fs.existsSync(this.configFile)) {
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
		if (os.platform() === 'win32') {
			this.steamcmdManager = new SteamCMDManagerWin();
		} else {
			throw new Error("Unsupported OS: " + os.platform() + " is not implemented in this version of steam updater");
		}

		ipcMain.on('ipc-main', async (event, args) => {
			console.log(args);
			switch(args.action as IPCAction) {
				case IPCAction.FONTEND_REQUEST_CONFIG:
					console.debug("Sending config to client");
					event.reply('ipc-main', {
						action: IPCAction.BACKEND_CONFIG_RESPONSE,
						data: this.getConfig()
					});
					break;

					default:
						console.log("Unknown action on ipc-main: " + args.action);	
					break;
			}
		});
	}

	async init() {
		if(!this.steamcmdManager.isSteamCMDInstalled()) {
			try {
				await this.steamcmdManager.installSteamCMD();
				this.steamcmdInstalled = true;
			} catch(err) {
				console.error(err);
				this.logError("Failed to install SteamCMD");
			}
		} else {
			this.steamcmdInstalled = true;
		}
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