import { ToastType } from "./ToastType";

export default interface ServerToastMessage {
	message: string,
	type: ToastType
}