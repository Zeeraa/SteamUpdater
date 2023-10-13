export default abstract class SymlinkCreator {
	abstract createSymlink(type: SymlinkType, source: string, symlink: string): Promise<void>;
}

export enum SymlinkType {
	FILE = "file", JUNCTION = "junction"
}