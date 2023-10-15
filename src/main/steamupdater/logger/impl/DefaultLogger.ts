import * as fs from 'fs';
import Logger from '../Logger';
import SteamUpdater from '../../SteamUpdater';
import { LogType } from '../../../../shared/dto/log/LogType';
import LogMessage from '../../../../shared/dto/log/LogMessage';
import { IPCAction } from '../../../../shared/IPCAction';
import { ConsoleColor } from '../../../../shared/ConsoleColor';

export default class DefaultLogger extends Logger {
	private logFile: string;
	private steamUpdater: SteamUpdater;
	private _messages: LogMessage[];

	constructor(logFile: string, steamUpdater: SteamUpdater) {
		super();
		this.logFile = logFile;
		this.steamUpdater = steamUpdater;
		this._messages = [];
	}

	logInfo(message: string, forceColor: ConsoleColor = null) {
		const out = this.prefixMultilineMessage(message, LogType.INFO);
		console.log(out);
		this.append(out);
		this.processMessage(message, LogType.INFO, forceColor);
	}

	logWarning(message: string, forceColor: ConsoleColor = null) {
		const out = this.prefixMultilineMessage(message, LogType.WARNING);
		console.warn(out);
		this.append(out);
		this.processMessage(message, LogType.WARNING, forceColor);
	}

	logError(message: string, forceColor: ConsoleColor = null) {
		const out = this.prefixMultilineMessage(message, LogType.ERROR);
		console.error(out);
		this.append(out);
		this.processMessage(message, LogType.ERROR, forceColor);
	}

	logStdout(message: string, forceColor: ConsoleColor = null) {
		const out = this.prefixMultilineMessage(message, LogType.STDOUT);
		console.log(out);
		this.append(out);
		this.processMessage(message, LogType.STDOUT, forceColor);
	}

	logStderr(message: string, forceColor: ConsoleColor = null) {
		const out = this.prefixMultilineMessage(message, LogType.STDERR);
		console.error(out);
		this.append(out);
		this.processMessage(message, LogType.STDERR, forceColor);
	}

	get messages(): LogMessage[] {
		return this._messages;
	}

	private processMessage(message: string, type: LogType, forceColor: ConsoleColor = null) {
		const logEntry: LogMessage = {
			message: message,
			type: type,
			forceColor: forceColor
		}
		this._messages.push(logEntry);
		this.steamUpdater.sendIPCAction(IPCAction.BACKEND_LOG_MESSAGE, logEntry);
	}

	private prefixMultilineMessage(message: string, type: LogType): string {
		const lines = message.split("\n");
		let out = "";
		lines.forEach(line => {
			out += "[" + type + "] " + line + (lines.length == 1 ? "" : "\n");
		});
		return out;
	}

	private append(message: string) {
		fs.appendFileSync(this.logFile, message + "\n");
	}
}