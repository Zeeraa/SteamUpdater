export default interface LoginTestResponse {
	result: LoginTestResult
}

export enum LoginTestResult {
	ERROR = "err:exception", NON_ZERO_EXIT_CODE = "err:non_zero", OK = "ok"
}