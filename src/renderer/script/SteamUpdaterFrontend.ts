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

export enum SteamUpdaterFrontendEvent {
	CONFIG_CHANGED = "configChanged",
	GAME_LOOKUP_RESULT = "gameLookupResult",
	STEAMAPPS_FOLDER_SELECTED = "steamappsFolderSelected",
	CONFIG_SAVED = "configSaved",
}

export default class SteamUpdaterFrontend {
	private _config: SteamUpdaterConfig;
	private _events = new EventEmitter();

	constructor() {
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

				case IPCAction.BACKEND_UPDATE_CONFIG_ACK:
					console.debug("Config successfully saved");
					this.events.emit(SteamUpdaterFrontendEvent.CONFIG_SAVED);
					break;

				case IPCAction.BACKEND_GAME_INFO_RESPONSE:
					this.events.emit(SteamUpdaterFrontendEvent.GAME_LOOKUP_RESULT, args.data as SteamGameLookupResult);
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

		console.log("Frontend init");
		this.fetchConfig();
	}

	set config(newConfig: SteamUpdaterConfig) {
		this._config = newConfig;
		this.events.emit(SteamUpdaterFrontendEvent.CONFIG_CHANGED, this._config);
	}

	get config() {
		return this._config;
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

	fetchConfig() {
		console.log("Requesting config from server");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FONTEND_REQUEST_CONFIG
		});
	}
}