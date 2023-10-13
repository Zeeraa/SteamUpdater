import SymlinkCreator, { SymlinkType } from "../SymlinkCreator";
import * as fs from "fs";

export default class GenericSymlinkCreator extends SymlinkCreator {
	createSymlink(type: SymlinkType, source: string, symlink: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				fs.symlinkSync(source, symlink, type);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}
}