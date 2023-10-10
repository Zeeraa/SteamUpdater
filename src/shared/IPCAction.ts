export enum IPCAction {
	/** Frontend sends this to backend to request the current config */
	FONTEND_REQUEST_CONFIG,
	/** Frontend sends this to update the config stored on the backend */
	FONTEND_UPDATE_CONFIG,
	/** Backend replies to let the frontend know the config was saved */
	BACKEND_UPDATE_CONFIG_ACK,
	/** Backend responds to frontend with config data */
	BACKEND_CONFIG_RESPONSE
}