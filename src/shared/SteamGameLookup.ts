import SteamAPIGameData from "./SteamAPI/SteamAPIGameData";

export interface SteamGameLookupRequest {
	appId: number
}

export interface SteamGameLookupResult {
	success: boolean;
	appId: number;
	error?: SteamGameLookupError
	data?: SteamAPIGameData
}

export enum SteamGameLookupError {
	NETWORK_ERROR = "err:network", NOT_FOUND = "err:not_found"
}