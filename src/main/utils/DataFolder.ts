import os from 'os';
import path from 'path';
import * as fs from 'fs'

export default class DataFolder {
	public static get(): string {
		if (os.platform() === 'win32') {
			return path.join(process.env.APPDATA, 'steamupdater');
		}

		return path.join(os.homedir(), 'steamupdater');
	}

	public static mkdir(): void {
		const folder = DataFolder.get();
		if(!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
		}
	}
}