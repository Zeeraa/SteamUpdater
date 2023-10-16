import React, { useState } from 'react'
import { Button, FormControl, InputGroup, Placeholder } from 'react-bootstrap'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

interface Props {
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value?: string;
	placeholder?: string;
}

export default function PasswordInputGroup({ onChange, value, placeholder }: Props) {
	const [visible, setVisible] = useState<boolean>(false);

	function toggle() {
		setVisible(!visible);
	}

	return (
		<InputGroup>
			<FormControl type={visible ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} />
			<Button onClick={toggle}>
				{visible ? <AiFillEyeInvisible /> : <AiFillEye />}
			</Button>
		</InputGroup>
	)
}
