export enum IPCAction {
	/** Frontend sends this to backend to request the current config */
	FONTEND_REQUEST_CONFIG = "client_get_cfg",
	/** Frontend sends this to update the config stored on the backend */
	FONTEND_UPDATE_CONFIG = "client_save_cfg",
	/** Sent when the frontend wants to look up a game from the steam api */
	FRONTEND_REQUEST_GAME_INFO = "client_appid_lookup",
	/** Sent when the frontend begins a login test */
	FRONTEND_BEGIN_LOGIN_TEST = "client_trigger_login_test",
	/** Backend replies to let the frontend know the config was saved */
	BACKEND_UPDATE_CONFIG_ACK = "server_config_updated",
	/** Backend responds to frontend with config data */
	BACKEND_CONFIG_RESPONSE = "server_config_data",
	/** Backend respondes with game lookup result */
	BACKEND_GAME_INFO_RESPONSE = "server_appid_lookup_result",
	/** Backend responds with login request result */
	BACKEND_LOGIN_REQUEST_RESULT = "server_login_test_result",
	/** Backend sends a toast message to the frontend */
	BACKEND_SEND_TOAST_MESSAGE = "server_send_toast_message"
}