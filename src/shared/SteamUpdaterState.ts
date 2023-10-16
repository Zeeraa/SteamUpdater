import SteamAccount from "./config/SteamAccount";
import SteamGame from "./config/SteamGame";

export default interface SteamUpdaterState {
	version: string;
	state: State;
	loginTestRunning: boolean;
	updateStatus?: UpdateStatus;
	steamcmdInstalled: boolean;
	steamappsPathError: boolean;
	updateStartedAt: string;
	gameUpdateStartedAt: string;
	autoStartPending: boolean;
	autoStartTimeLeftSeconds: number;
}

export interface UpdateStatus {
	game: SteamGame;
	currentIndex: number;
	totalGames: number;
}

export enum State {
	READY = "ready", ERROR = "error", LOGIN_TEST_RUNNING = "login_test_running", UPDATING = "updating"
}