import { ConsoleColor } from "../../ConsoleColor";
import { LogType } from "./LogType";

export default interface LogMessage {
	message: string;
	type: LogType;
	forceColor?: ConsoleColor
}