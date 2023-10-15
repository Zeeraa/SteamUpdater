import DiscordWebhookConfig from "./config/DiscordWebhookConfig";
import SteamAccount from "./config/SteamAccount";
import SteamGame from "./config/SteamGame";
import { SteamUpdaterMode } from "./config/SteamUpdaterMode";

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

	// Notifications
	discordWebhookConfig: DiscordWebhookConfig;
}