import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import SteamUpdaterFrontend from './script/SteamUpdaterFrontend';
import { SteamUpdaterContext } from './context/SteamUpdaterContext';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const steamUpdater = new SteamUpdaterFrontend();

root.render(
<>
	<SteamUpdaterContext.Provider value={steamUpdater}>
		<BrowserRouter>
			<App/>
		</BrowserRouter>
	</SteamUpdaterContext.Provider>
</>
);
