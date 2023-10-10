import SteamAccount from "./SteamAccount";
import SteamGame from "./SteamGame";
import { SteamUpdaterMode } from "./SteamUpdaterMode";

export interface SteamUpdaterConfig {
	mode: SteamUpdaterMode;
	
	// Scheduled mode settings
	scheduledUpdateTime: string;
	
	// Auto mode settings
	shutdownOnFinish: boolean;
	
	// Steam settings
	steamPath?: string;

	// Games and accounts
	accounts: SteamAccount[];
	games: SteamGame[];
}