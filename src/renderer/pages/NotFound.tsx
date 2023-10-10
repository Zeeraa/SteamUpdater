import React from 'react'
import { useLocation } from 'react-router-dom'

export default function NotFound() {
	const location = useLocation();

	return (
		<div>
			<h1>Not found</h1>
			<p>
				The requested resource at {location.pathname} could not be found
			</p>
		</div>	
	)
}