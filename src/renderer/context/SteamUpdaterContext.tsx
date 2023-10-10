import React, { createContext, useContext } from 'react';
import SteamUpdaterFrontend from '../script/SteamUpdaterFrontend';

export const SteamUpdaterContext = createContext<SteamUpdaterFrontend | undefined>(undefined);

export function useSteamUpdater() {
	const context = useContext(SteamUpdaterContext);
	if(!context) {
		throw new Error('useSteamUpdater must be used within a SteamUpdaterProvider');
	}
	return context;
}