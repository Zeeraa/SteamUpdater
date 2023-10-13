export default interface SteamAPIGameData {
	type: string;
	name: string;
	steam_appid: number;
	is_free: boolean;
	detailed_description: string;
	about_the_game: string;
	short_description: string;
	header_image: string;
	capsule_image: string;
	capsule_imagev5: string;
	developers: string[];
	publishers: string[];
	genres: Genre[];
	screenshots: Screenshot[];
	background: string;
	background_raw: string;

}

export interface Genre {
	id: number;
	description: string;
}

export interface Screenshot {
	id: number;
	path_thumbnail: string;
	path_full: string;
}