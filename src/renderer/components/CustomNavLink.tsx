import React from 'react'
import { Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
	children: any;
	path: string;
}

export default function CustomNavLink({children, path}: Props) {
	const navigate = useNavigate();
	const location = useLocation();
	
	function handleClick() {
		navigate(path);
	}

	return (
		<Nav.Item>
			<Nav.Link onClick={handleClick} active={location.pathname == path}>
				{children}
			</Nav.Link>
		</Nav.Item>
	)
}
