import { exec } from 'child_process';
import { platform } from 'os';

export default class OSUtils {
	static shutdown(seconds: number): Promise<void> {
		return new Promise((resolve, reject) => {
			const osType = platform();
			let command: string = null;

			if (osType === 'win32') {
				command = `shutdown /s /t ${seconds}`;
			} else if (osType === 'linux' || osType === 'darwin') {
				command = `shutdown -h +${seconds}`;
			} else {
				reject(new Error('Unsupported operating system'));
			}

			exec(command, (error) => {
				if (error) {
					reject(error)
				} else {
					resolve();
				}
			});
		});
	}
}