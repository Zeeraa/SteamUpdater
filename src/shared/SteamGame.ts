export default interface SteamGame {
	id: string;
	appId: number;
	displayName: string;
	accountId?: string;
	customSteamDirectory?: string;
	thumbnail?: string;
	disabled: boolean;
}