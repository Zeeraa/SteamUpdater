import { Consumer } from '../../../utils/Consumer';
import SteamCMDManager from '../SteamCMDManager';
import DataFolder from '../../../utils/DataFolder';
import axios from 'axios';
import path from 'path';
import * as fs from 'fs-extra'
import AdmZip from 'adm-zip';
import SteamCMDProcess from '../SteamCMDProcess';
import SteamCMDProcessWin from './SteamCMDProcessWin';

export default class SteamCMDManagerWin extends SteamCMDManager {
	public static STEAMCMD_URL_WIN = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip";

	private steamcmdFolder: string;
	private steamcmdExecutable: string;

	constructor() {
		super();
		this.steamcmdFolder = path.join(DataFolder.get(), "steamcmd");
		this.steamcmdExecutable = path.join(this.steamcmdFolder, 'steamcmd.exe');

		console.log("SteamCMD directory: " + this.steamcmdFolder);

		if(!fs.existsSync(this.steamcmdFolder)) {
			fs.mkdirSync(this.steamcmdFolder, { recursive: true });
		}
	}

	isSteamCMDInstalled(): boolean {
		return fs.existsSync(this.steamcmdExecutable);
	}

	installSteamCMD(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				console.log("Trying to install steamcmd to " + this.steamcmdFolder);
				if(fs.existsSync(this.steamcmdFolder)) {
					console.log("Deleting existing steamcmd folder...");
					fs.removeSync(this.steamcmdFolder);
				}
				fs.mkdirSync(this.steamcmdFolder, { recursive: true });

				console.log("Downloading zip file from " + SteamCMDManagerWin.STEAMCMD_URL_WIN) + "...";
				const response = await axios.get(SteamCMDManagerWin.STEAMCMD_URL_WIN, { responseType: 'arraybuffer' });


				const zipFilePath = path.join(this.steamcmdFolder, 'steamcmd.zip');
				if(fs.existsSync(zipFilePath)) {
					console.log("Removing old steamcmd.zip file...");
					fs.removeSync(zipFilePath);
				}

				console.log("Writing zip file to disk...");
				await fs.writeFile(zipFilePath, response.data);

				console.log("Extracting steamcmd.zip...");
				const zip = new AdmZip(zipFilePath);
				zip.extractAllTo(this.steamcmdFolder, true);

				console.log("Cleaning up...");
				fs.removeSync(zipFilePath);

				if(fs.existsSync(this.steamcmdExecutable)) {
					console.log("Steamcmd downloaded to " + this.steamcmdExecutable);
				} else {
					console.error("Failed to download steamcmd. Did not find exe at " + this.steamcmdExecutable);
					throw new Error("Steamcmd download failed. Expected to extract to " + this.steamcmdExecutable + " but file was not found");
				}
				resolve();
			} catch(err) {
				reject(err);
			}
		});
	}

	runCommand(command: string, stdout: Consumer<string>, stderr: Consumer<string>): SteamCMDProcess {
		console.log("Starting SteamCMD");
		return new SteamCMDProcessWin(this.steamcmdFolder, this.steamcmdExecutable, command, false, stdout, stderr);
	}

	runCommandWithTerminal(command: string): SteamCMDProcess {
		console.log("Starting SteamCMD with terminal");
		return new SteamCMDProcessWin(this.steamcmdFolder, this.steamcmdExecutable, command, true);
	}

	getSteamCMDExecutable(): string {
		return this.steamcmdExecutable;
	}

	getSteamCMDFolder(): string {
		return this.steamcmdFolder;
	}

	uninstall(): boolean {
		if(fs.existsSync(this.steamcmdFolder)) {
			console.log("Uninstalling steamcmd...");
			fs.removeSync(this.steamcmdFolder);
			return true;
		}
		return false;
	}
}
