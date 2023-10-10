import { IPCAction } from "../../shared/IPCAction";
import { SteamUpdaterConfig } from "../../shared/SteamUpdaterConfig";
import { SteamUpdaterMode } from "../../shared/SteamUpdaterMode";

export default class SteamUpdaterFrontend {
	public config: SteamUpdaterConfig;
	
	constructor() {
		this.config = {
			accounts: [],
			games: [],
			mode: SteamUpdaterMode.MANUAL,
			scheduledUpdateTime: "00:00",
			shutdownOnFinish: false,
			steamPath: ""
		};

		window.electron.ipcRenderer.on("ipc-main", (args: any) => {
			switch(args.action as IPCAction) {
				case IPCAction.BACKEND_CONFIG_RESPONSE:
					console.debug("Server replied with config");
					this.config = args.data as SteamUpdaterConfig
					break;

					default:
						console.log("Unknown action on ipc-main: " + args.action);	
					break;
			}
		});

		console.log("Frontend init");
		this.fetchConfig();
	}

	fetchConfig() {
		console.log("Requesting config from server");
		window.electron.ipcRenderer.sendMessage('ipc-main', {
			action: IPCAction.FONTEND_REQUEST_CONFIG
		});
	}
}