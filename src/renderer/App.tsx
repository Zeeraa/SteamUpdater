import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
	const [test, setTest] = useState<string>('');

	async function send() {
		const resp = await axios.get('https://wtfismyip.com/json');
		setTest(JSON.stringify(resp.data));
	}

	useEffect(() => {
		send();
	}, []);

	return (
		<div>
			<h1 className="text-danger">Hello World!</h1>
			{test}
		</div>
	);
}
