import SteamAccount from "./SteamAccount";
import SteamGame from "./SteamGame";

export default interface SteamUpdaterState {
	state: State;
	loginTestRunning: boolean;
	updateStatus?: UpdateStatus;
	steamcmdInstalled: boolean;
	steamappsPathError: boolean;
}

export interface UpdateStatus {
	game: SteamGame;
	currentIndex: number;
	totalGames: number;
}

export enum State {
	READY = "ready", ERROR = "error", LOGIN_TEST_RUNNING = "login_test_running", UPDATING = "updating"
}