/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import DataFolder from './utils/DataFolder';
import SteamUpdater from './steamupdater/SteamUpdater';
import axios from 'axios';
import VersionUtils from '../shared/utils/VersionUtils';
import { initialize } from "@aptabase/electron/main";

initialize("A-EU-2625809505");

interface S3Config {
	minimum_allowed_version: string
}

async function init() {
	let mainWindow: BrowserWindow | null = null;

	const gotLock = app.requestSingleInstanceLock();

	if (!gotLock) {
		app.quit();
		process.exit(0);
	}

	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}
	});

	const version = "0.0.1";
	try {
		console.log("Version: " + version);
		console.log("Fetching program config from s3");
		const configRequest = await axios.get("https://zeeraa.s3.eu-north-1.amazonaws.com/steamupdater/settings.json");
		const config: S3Config = configRequest.data;

		if (VersionUtils.compareVersionNumbers(version, config.minimum_allowed_version) < 0) {
			dialog.showErrorBox("Steam Updater", "You need to update to version " + config.minimum_allowed_version + " or later to continue running this application");
			console.error("You need to update to version " + config.minimum_allowed_version + " or later to continue running this application");
			process.exit(1);
		}
	} catch (err) {
		console.error(err);
		console.error("Failed to fetch settings from Amazon S3. Check your connection and try again");
		dialog.showErrorBox("Steam Updater", "Failed to fetch settings from Amazon S3. Check your connection and try again");
		process.exit(1);
	}

	DataFolder.mkdir();

	const steamUpdater = new SteamUpdater(version);

	class AppUpdater {
		constructor() {
			log.transports.file.level = 'info';
			autoUpdater.logger = log;
			autoUpdater.checkForUpdatesAndNotify();
		}
	}

	if (process.env.NODE_ENV === 'production') {
		const sourceMapSupport = require('source-map-support');
		sourceMapSupport.install();
	}

	const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

	if (isDebug) {
		require('electron-debug')();
	}

	const installExtensions = async () => {
		const installer = require('electron-devtools-installer');
		const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
		const extensions = ['REACT_DEVELOPER_TOOLS'];

		return installer
			.default(
				extensions.map((name) => installer[name]),
				forceDownload,
			)
			.catch(console.log);
	};

	const createWindow = async () => {
		if (isDebug) {
			await installExtensions();
		}

		const RESOURCES_PATH = app.isPackaged
			? path.join(process.resourcesPath, 'assets')
			: path.join(__dirname, '../../assets');

		const getAssetPath = (...paths: string[]): string => {
			return path.join(RESOURCES_PATH, ...paths);
		};

		mainWindow = new BrowserWindow({
			autoHideMenuBar: true,
			show: false,
			width: 1024,
			height: 728,
			icon: getAssetPath('icon.png'),
			webPreferences: {
				preload: app.isPackaged
					? path.join(__dirname, 'preload.js')
					: path.join(__dirname, '../../.erb/dll/preload.js'),
			},
		});

		mainWindow.loadURL(resolveHtmlPath('index.html'));

		mainWindow.on('ready-to-show', () => {
			if (!mainWindow) {
				throw new Error('"mainWindow" is not defined');
			}
			steamUpdater.mainWindow = mainWindow;
			if (process.env.START_MINIMIZED) {
				mainWindow.minimize();
			} else {
				mainWindow.show();
			}
		});

		mainWindow.on('closed', () => {
			mainWindow = null;
		});

		// Open urls in the user's browser
		mainWindow.webContents.setWindowOpenHandler((edata) => {
			shell.openExternal(edata.url);
			return { action: 'deny' };
		});

		// Remove this if your app does not use auto updates
		// eslint-disable-next-line
		new AppUpdater();
	};

	/**
	 * Add event listeners...
	 */

	app.on('window-all-closed', () => {
		// Respect the OSX convention of having the application in memory even
		// after all windows have been closed
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.whenReady()
		.then(() => {
			createWindow();
			steamUpdater.init();
			app.on('activate', () => {
				// On macOS it's common to re-create a window in the app when the
				// dock icon is clicked and there are no other windows open.
				if (mainWindow === null) createWindow();
			});
		})
		.catch(console.log);

}

init();