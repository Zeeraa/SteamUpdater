import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

import "./HiddenPasswordSpan.css";

interface Props {
	password: string;
}

export default function HiddenPasswordSpan({ password }: Props) {
	const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

	function maskPassword(password: string): string {
		return '*'.repeat(password.length);
	}

	function toggle() {
		setPasswordVisible(!passwordVisible);
	}

	return (
		<span>
			<span>{passwordVisible ? password : maskPassword(password)}</span>
			<span className='hidden-password-toggle' onClick={toggle}>{passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}</span>
		</span>
	)

}