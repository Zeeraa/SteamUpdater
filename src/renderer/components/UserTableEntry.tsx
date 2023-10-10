import React from 'react'
import SteamAccount from '../../shared/SteamAccount'
import HiddenPasswordSpan from './HiddenPasswordSpan'

interface Props {
	steamAccount: SteamAccount
}

export function UserTableEntry({steamAccount}: Props) {
	return (
		<tr>
			<td>{steamAccount.username}</td>
			<td>
				<HiddenPasswordSpan password={steamAccount.password}/>
			</td>
		</tr>
	)
}