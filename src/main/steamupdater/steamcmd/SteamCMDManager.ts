import { Consumer } from '../../utils/Consumer';
import SteamCMDProcess from './SteamCMDProcess';

export default abstract class SteamCMDManager {
	abstract isSteamCMDInstalled(): boolean;

	abstract installSteamCMD(): Promise<void>;

	abstract runCommand(command: string, stdout: Consumer<string>, stderr: Consumer<string>): SteamCMDProcess

	abstract runCommandWithTerminal(command: string): SteamCMDProcess

	abstract getSteamCMDExecutable(): string;

	abstract getSteamCMDFolder(): string;
}