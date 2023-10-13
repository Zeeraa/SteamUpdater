import EventEmitter from "events";
import { IPCAction } from "../../shared/IPCAction";
import { SteamUpdaterConfig } from "../../shared/SteamUpdaterConfig";
import { SteamUpdaterMode } from "../../shared/SteamUpdaterMode";
import { SteamGameLookupRequest, SteamGameLookupResult } from "../../shared/SteamGameLookup";
import toast from 'react-hot-toast';
import ServerToastMessage from "../../shared/toast/ServerToastMessage";
import { ToastType } from "../../shared/toast/ToastType";
import LoginTestResponse, { LoginTestResult } from "../../shared/LoginTestResponse";
import SteamappsSelectedResponse from "../../shared/SteamappsSelectedResponse";
import SteamUpdaterState, { State } from "../../shared/SteamUpdaterState";
import LogMessage from "../../shared/LogMessage";

export enum SteamUpdaterFrontendEvent {
	CONFIG_CHANGED = "configChanged",
	GAME_LOOKUP_RESULT = "gameLookupResult",
	STEAMAPPS_FOLDER_SELECTED = "steamappsFolderSelected",
	CONFIG_SAVED = "configSaved",
	STATE_UPDATE = "stateUpdate",
	LOGS_FETCHED = "logsFetched",
	LOG_MESSAGE = "logMessage",
}

export default class SteamUpdaterFrontend {
	private _config: SteamUpdaterConfig;
	private _state: SteamUpdaterState;
	private _events = new EventEmitter();
	private _logs: LogMessage[] = [];
	private _logBacklog: LogMessage[] = [];
	private initialLogsFetched: boolean = false;

	constructor() {
		this._state = {
			loginTestRunning: false,
			state: State.READY,
			steamappsPathError: false,
			steamcmdInstalled: false,
			updateStatus: null
		};

		this._config = {
			accounts: [],
			games: [],
			mode: SteamUpdaterMode.MANUAL,
			scheduledUpdateTime: "00:00",
			shutdownOnFinish: false,
			steamPath: ""
		};

		window.electron.ipcRenderer.on("ipc-main", (args: any) => {
			switch (args.action as IPCAction) {
				case IPCAction.BACKEND_CONFIG_RESPONSE:
					this.config = args.data as SteamUpdaterConfig
					break;

				case IPCAction.BACKEND_CURRENT_STATE:
					this.state = args.data as SteamUpdaterState
					break;

				case IPCAction.BACKEND_UPDATE_CONFIG_ACK:
					console.debug("Config successfully saved");
					this.events.emit(SteamUpdaterFrontendEvent.CONFIG_SAVED);
					break;

				case IPCAction.BACKEND_GAME_INFO_RESPONSE:
					this.events.emit(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, args.data as SteamGameLookupResult);
					break;

				case IPCAction.BACKEND_LOG_MESSAGE:
					const logMessage = args.data as LogMessage;
					console.log("[" + logMessage.type + "] " + logMessage.message);
					if (this.initialLogsFetched) {
						this.events.emit(SteamUpdaterFrontendEvent.LOG_MESSAGE, logMessage);
						this._logs.push(logMessage);
					} else {
						this._logBacklog.push(logMessage);
					}
					break;

				case IPCAction.BACKEND_FULL_LOG:
					if (!this.initialLogsFetched) {
						const logMessages = args.data as LogMessage[];
						this._logs = logMessages;
						this.initialLogsFetched = true;
						this.events.emit(SteamUpdaterFrontendEvent.LOGS_FETCHED, this._logs);
						this._logBacklog.forEach(backlogEntry => {
							this.events.emit(SteamUpdaterFrontendEvent.LOG_MESSAGE, backlogEntry);
							this._logs.push(backlogEntry);
						});
						this._logBacklog = [];
					}
					break;

				case IPCAction.BACKEND_SEND_TOAST_MESSAGE:
					const toastData = args.data as ServerToastMessage;
					switch (toastData.type) {
						case ToastType.ERROR:
							toast.error(toastData.message);
							break;

						case ToastType.SUCCESS:
							toast.success(toastData.message);
							break;

						default:
							console.error("Invalid toast type: " + toastData.type);
							break;
					}
					break;

				case IPCAction.BACKEND_LOGIN_REQUEST_RESULT:
					const loginTestResponse: LoginTestResponse = args.data as LoginTestResponse;
					switch (loginTestResponse.result) {
						case LoginTestResult.OK:
							toast.success("Login test finished");
							break;

						case LoginTestResult.ERROR:
							toast.error("Failed to start login test");
							break;

						case LoginTestResult.NON_ZERO_EXIT_CODE:
							toast.error("Login test exited with non zero exit code");
							break;

						default:
							console.error("Invalid login test response: " + loginTestResponse.result);
							break;
					}
					break;

				case IPCAction.BACKEND_STEAMAPPS_SELECTED:
					this.events.emit(SteamUpdaterFrontendEvent.STEAMAPPS_FOLDER_SELECTED, args.data as SteamappsSelectedResponse);
					break;

				default:
					console.log("Unknown action on ipc-main: " + args.action);
					break;
			}
		});
	}

	init() {
		console.log("Frontend init");
		this.fetchConfig();
		this.fetchState();
		this.fetchInitialLogs();
	}

	get logs() {
		return this._logs;
	}

	get state() {
		return this._state;
	}

	set state(newState: SteamUpdaterState) {
		this._state = newState;
		console.log(newState);
		// TODO: Check if state changed
		this.events.emit(SteamUpdaterFrontendEvent.STATE_UPDATE, newState);
	}

	get config() {
		return this._config;
	}

	set config(newConfig: SteamUpdaterConfig) {
		this._config = newConfig;
		// TODO: Check if config changed
		this.events.emit(SteamUpdaterFrontendEvent.CONFIG_CHANGED, newConfig);
	}

	get events() {
		return this._events;
	}

	startUpdate() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_START_UPDATE
		});
	}

	triggerLoginTest() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_BEGIN_LOGIN_TEST
		});
	}

	invokeSteamappsPicker() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_OPEN_STEAMAPPS_PICKER
		});
	}

	triggerGameLookup(appId: number) {
		const request: SteamGameLookupRequest = {
			appId: appId
		}

		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_REQUEST_GAME_INFO,
			data: request
		});
	}

	saveConfig() {
		console.log("Saving config");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FONTEND_UPDATE_CONFIG,
			data: this._config
		});
	}

	killSteamCMD() {
		console.log("Sending kill request");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_KILL_UPDATE
		});
	}

	fetchConfig() {
		console.log("Requesting config from server");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FONTEND_REQUEST_CONFIG
		});
	}

	fetchState() {
		console.log("Requesting state from server");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_FORCE_STATE_UPDATE
		});
	}

	fetchInitialLogs() {
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FRONTEND_REQUEST_LOGS
		});
	}
}