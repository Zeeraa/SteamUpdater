import { ConsoleColor } from "../../../shared/ConsoleColor";

export default abstract class Logger {
	abstract logInfo(message: string, forceColor?: ConsoleColor);

	abstract logWarning(message: string, forceColor?: ConsoleColor);

	abstract logError(message: string, forceColor?: ConsoleColor);

	abstract logStdout(message: string, forceColor?: ConsoleColor);

	abstract logStderr(message: string, forceColor?: ConsoleColor);
}