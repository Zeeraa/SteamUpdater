export enum IPCAction {
	/** Frontend sends this to force backend to send its state */
	FRONTEND_FORCE_STATE_UPDATE = "FRONTEND_FORCE_STATE_UPDATE",
	/** Frontend sends this to backend to request the current config */
	FONTEND_REQUEST_CONFIG = "FONTEND_REQUEST_CONFIG",
	/** Frontend sends this to update the config stored on the backend */
	FONTEND_UPDATE_CONFIG = "FONTEND_UPDATE_CONFIG",
	/** Sent when the frontend wants to look up a game from the steam api */
	FRONTEND_REQUEST_GAME_INFO = "FRONTEND_REQUEST_GAME_INFO",
	/** Sent when the frontend begins a login test */
	FRONTEND_BEGIN_LOGIN_TEST = "FRONTEND_BEGIN_LOGIN_TEST",
	/** Sent when the frontend opens the steamapps picker dialog */
	FRONTEND_OPEN_STEAMAPPS_PICKER = "FRONTEND_OPEN_STEAMAPPS_PICKER",
	/** Sent when the client starts an update */
	FRONTEND_START_UPDATE = "FRONTEND_START_UPDATE",
	/** Sent by frontend to request full log */
	FRONTEND_REQUEST_LOGS = "FRONTEND_REQUEST_LOGS",
	/** Sent when the frontend tries to kill the login test or update */
	FRONTEND_KILL_UPDATE = "FRONTEND_KILL_UPDATE",
	/** Sent when the client forces a reinstall of steamcmd */
	FRONTEND_REINSTALL_STEAMCMD = "FRONTEND_REINSTALL_STEAMCMD",
	/** Backend sends state to frontend */
	BACKEND_CURRENT_STATE = "BACKEND_CURRENT_STATE",
	/** Backend replies to let the frontend know the config was saved */
	BACKEND_UPDATE_CONFIG_ACK = "BACKEND_UPDATE_CONFIG_ACK",
	/** Backend responds to frontend with config data */
	BACKEND_CONFIG_RESPONSE = "BACKEND_CONFIG_RESPONSE",
	/** Backend respondes with game lookup result */
	BACKEND_GAME_INFO_RESPONSE = "BACKEND_GAME_INFO_RESPONSE",
	/** Backend responds with login request result */
	BACKEND_LOGIN_REQUEST_RESULT = "BACKEND_LOGIN_REQUEST_RESULT",
	/** Backend sends a toast message to the frontend */
	BACKEND_SEND_TOAST_MESSAGE = "BACKEND_SEND_TOAST_MESSAGE",
	/** Backend sends the selected steamapps directory */
	BACKEND_STEAMAPPS_SELECTED = "BACKEND_STEAMAPPS_SELECTED",
	/** Backend sends this when a new message is logged */
	BACKEND_LOG_MESSAGE = "BACKEND_LOG_MESSAGE",
	/** Backend sends fill log to frontend */
	BACKEND_FULL_LOG = "BACKEND_FULL_LOG",
	/** Frontend request to cancel autro update timer */
	FRONTEND_CANCEL_AUTOUPDATE_TIMER = "FRONTEND_CANCEL_AUTOUPDATE_TIMER"
}