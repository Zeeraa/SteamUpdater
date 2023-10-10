export default abstract class SteamCMDProcess {
	abstract isRunning(): boolean

	abstract kill(): void

	abstract getPromise(): Promise<number>
}