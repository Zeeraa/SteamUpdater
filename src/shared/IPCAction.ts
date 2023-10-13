export enum IPCAction {
	/** Frontend sends this to force backend to send its state */
	FRONTEND_FORCE_STATE_UPDATE = "client_force_state_update",
	/** Frontend sends this to backend to request the current config */
	FONTEND_REQUEST_CONFIG = "client_get_cfg",
	/** Frontend sends this to update the config stored on the backend */
	FONTEND_UPDATE_CONFIG = "client_save_cfg",
	/** Sent when the frontend wants to look up a game from the steam api */
	FRONTEND_REQUEST_GAME_INFO = "client_appid_lookup",
	/** Sent when the frontend begins a login test */
	FRONTEND_BEGIN_LOGIN_TEST = "client_trigger_login_test",
	/** Sent when the frontend opens the steamapps picker dialog */
	FRONTEND_OPEN_STEAMAPPS_PICKER = "client_open_steamapps_picker",
	/** Sent when the client starts an update */
	FRONTEND_START_UPDATE = "client_start_update",
	/** Sent by frontend to request full log */
	FRONTEND_REQUEST_LOGS = "client_request_logs",
	/** Sent when the frontend tries to kill the login test or update */
	FRONTEND_KILL_UPDATE = "client_kill_update",
	/** Sent when the client forces a reinstall of steamcmd */
	FRONTEND_REINSTALL_STEAMCMD = "client_reinstall_steamcmd",
	/** Backend sends state to frontend */
	BACKEND_CURRENT_STATE = "server_current_state",
	/** Backend replies to let the frontend know the config was saved */
	BACKEND_UPDATE_CONFIG_ACK = "server_config_updated",
	/** Backend responds to frontend with config data */
	BACKEND_CONFIG_RESPONSE = "server_config_data",
	/** Backend respondes with game lookup result */
	BACKEND_GAME_INFO_RESPONSE = "server_appid_lookup_result",
	/** Backend responds with login request result */
	BACKEND_LOGIN_REQUEST_RESULT = "server_login_test_result",
	/** Backend sends a toast message to the frontend */
	BACKEND_SEND_TOAST_MESSAGE = "server_send_toast_message",
	/** Backend sends the selected steamapps directory */
	BACKEND_STEAMAPPS_SELECTED = "server_steamapps_selected",
	/** Backend sends this when a new message is logged */
	BACKEND_LOG_MESSAGE = "server_log_message",
	/** Backend sends fill log to frontend */
	BACKEND_FULL_LOG = "server_full_log"
}