export default interface DiscordWebhookConfig {
	enabled: boolean;
	webhook: string;
	pings: string;
	pingForGameProgress: boolean;
	showGameProgress: boolean;
}