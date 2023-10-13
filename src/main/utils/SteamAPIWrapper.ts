import axios from "axios";
import { SteamGameLookupError, SteamGameLookupResult } from "../../shared/SteamGameLookup";
import SteamAPIGameData from "../../shared/SteamAPI/SteamAPIGameData";

export default class SteamAPIWrapper {
	static async lookupSteamGame(appId: number): Promise<SteamGameLookupResult> {
		appId = parseInt("" + appId);
		let response: SteamGameLookupResult = null;
		try {
			const steamResponse = await axios.get("https://store.steampowered.com/api/appdetails?appids=" + appId);
			const appData = steamResponse.data["" + appId];
			if (appData.success) {
				const gameData: SteamAPIGameData = appData.data;
				response = {
					appId: appId,
					success: true,
					data: gameData
				}
			} else {
				response = {
					appId: appId,
					success: false,
					error: SteamGameLookupError.NOT_FOUND
				}
			}
		} catch (err) {
			console.error("Failed to lookup appId " + appId);
			console.error(err);
			response = {
				appId: appId,
				success: false,
				error: SteamGameLookupError.NETWORK_ERROR
			}
		}
		return response;
	}
}