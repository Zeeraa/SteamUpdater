import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useSteamUpdater } from '../../context/SteamUpdaterContext';
import LogMessage from '../../../shared/LogMessage';
import { SteamUpdaterFrontendEvent } from '../../script/SteamUpdaterFrontend';
import { WebglAddon } from 'xterm-addon-webgl';

import "xterm/css/xterm.css";
import { LogType } from '../../../shared/LogType';
import { ConsoleColor } from '../../../shared/ConsoleColor';

interface Props {
	className?: string;
}

export default function LogOutput({ className }: Props) {
	const steamUpdater = useSteamUpdater();
	const terminalRef = useRef();

	useEffect(() => {
		const terminal = new Terminal();
		//const canvas = new CanvasAddon();
		const fit = new FitAddon();
		const webgl = new WebglAddon();

		//terminal.loadAddon(canvas);
		terminal.loadAddon(fit);
		terminal.loadAddon(webgl);

		terminal.open(terminalRef.current);

		const appendMessage = (log: LogMessage) => {
			const lines: string[] = log.message.split("\n");
			let linePrefix = "";
			switch (log.type) {
				case LogType.INFO:
				case LogType.WARNING:
				case LogType.ERROR:
					linePrefix = "[" + log.type + "] ";
					break;


				default:
					break;
			}

			let color = "";
			switch (log.type) {
				case LogType.INFO:
					color = ConsoleColor.WHITE;
					break;

				case LogType.WARNING:
					color = ConsoleColor.YELLOW;
					break;

				case LogType.ERROR:
				case LogType.STDERR:
					color = ConsoleColor.RED;
					break;

				case LogType.STDOUT:
					color = ConsoleColor.CYAN;
					break;

				default:
					break;
			}

			terminal.writeln(color + linePrefix + (log.forceColor == null ? "" : log.forceColor) + log.message + ConsoleColor.RESET);
		}

		const handleLogs = (logs: LogMessage[]) => {
			terminal.clear();
			logs.forEach(log => appendMessage(log));
		}

		const handleLog = (log: LogMessage) => {
			appendMessage(log);
		}

		const updateSize = () => {
			fit.fit();
		}

		steamUpdater.logs.forEach((log: LogMessage) => appendMessage(log));

		steamUpdater.events.on(SteamUpdaterFrontendEvent.LOGS_FETCHED, handleLogs);
		steamUpdater.events.on(SteamUpdaterFrontendEvent.LOG_MESSAGE, handleLog);

		window.addEventListener('resize', updateSize);

		updateSize();

		return () => {
			fit.dispose();
			webgl.dispose();
			terminal.dispose();
			steamUpdater.events.off(SteamUpdaterFrontendEvent.LOGS_FETCHED, handleLogs);
			steamUpdater.events.off(SteamUpdaterFrontendEvent.LOG_MESSAGE, handleLog);
			window.removeEventListener('resize', updateSize);
		}
	}, []);

	return (
		<div ref={terminalRef} className={className}></div>
	)
}
