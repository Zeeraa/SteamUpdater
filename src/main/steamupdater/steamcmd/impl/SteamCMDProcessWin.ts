import { spawn, ChildProcess } from 'child_process';
import * as iconv from 'iconv-lite';

import SteamCMDProcess from '../SteamCMDProcess';
import { Consumer } from '../../../utils/Consumer';

export default class SteamCMDProcessWin extends SteamCMDProcess {
	private promise: Promise<number>;
	private resolve: any;

	private powershellProcess: ChildProcess;

	constructor(workDir: string, exePath: string, args: string, runInTerminal: boolean, stdout: Consumer<string> = null, stderr: Consumer<string> = null) {
		super();
		this.promise = new Promise((resolve) => {
			this.resolve = resolve;
		});

		if(runInTerminal) {
			this.powershellProcess = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Normal', '-Command', exePath, args], {
				detached: true,
				shell: true
			});
		} else {
			this.powershellProcess = spawn('powershell.exe', [ '-NoProfile', '-NoLogo', '-ExecutionPolicy', 'Bypass', '-Command', exePath, args], {
				shell: true,
				stdio: ['pipe', 'pipe', 'pipe']
			},
		);	
		}
		

		this.powershellProcess.stdout.on('data', (data) => {
			if(stdout != null) {
				stdout(iconv.decode(data, 'utf-8'));
			}
		});

		this.powershellProcess.stderr.on('data', (data) => {
			if(stderr != null) {
				stderr(iconv.decode(data, 'utf-8'));
			}
		});

		this.powershellProcess.on('exit', (code, signal) => {
			console.log("SteamCMD process exited");
			this.resolve(code);
		});
	}

	getPromise(): Promise<number> {
		return this.promise;
	}

	isRunning(): boolean {
		return !this.powershellProcess.killed
	}

	kill(): void {
		this.powershellProcess.kill();
	}
}
