import { MessageBuilder, Webhook } from "discord-webhook-node";
import SteamGame from "../../shared/config/SteamGame";
import { format } from 'date-fns';
import { SteamUpdaterConfig } from "../../shared/SteamUpdaterConfig";
import { SteamUpdaterMode } from "../../shared/config/SteamUpdaterMode";

export default class DiscordWebhookUtils {
	public static THUMBNAIL: string = "https://zeeraa.s3.eu-north-1.amazonaws.com/steamupdater/assets/img/icon.png";

	static async sendStartMessage(config: SteamUpdaterConfig, games: SteamGame[], reason: SteamUpdaterMode) {
		const gamesString = games.reduce((result, item) => {
			if (result !== "") {
				return result + ', ' + item.displayName;
			} else {
				return item.displayName;
			}
		}, '')

		const webhook = new Webhook(config.discordWebhookConfig.webhook);
		const embed = new MessageBuilder();

		let type = "Update started";
		switch (reason) {
			case SteamUpdaterMode.AUTO:
				type = "Automatic update started"
				break;

			case SteamUpdaterMode.SCHEDULED:
				type = "Scheduled update started"
				break;

			case SteamUpdaterMode.MANUAL:
				type = "Manually triggered update"
				break;
			default: break;
		}

		embed.setTitle("Update started");
		embed.setColor(0x00FF00);
		if (config.discordWebhookConfig.pings.trim().length > 0) {
			embed.setText(config.discordWebhookConfig.pings);
		}
		embed.setDescription("Update of " + games.length + " games started at " + format(new Date(), 'yyyy-MM-dd_HH-mm-ss'));
		embed.addField("Games", gamesString);
		embed.addField("Steam directory", config.steamPath);
		embed.addField("Reason", reason);
		embed.setTimestamp();
		embed.setThumbnail(DiscordWebhookUtils.THUMBNAIL);
		await webhook.send(embed);
	}

	static async sendGameMessage(config: SteamUpdaterConfig, game: SteamGame, index: number, total: number) {
		let accountName = "Anonymous";
		if (game.accountId != null) {
			const account = config.accounts.find(a => a.id == game.accountId);
			if (account != null) {
				accountName = account.username;
			}
		}

		const webhook = new Webhook(config.discordWebhookConfig.webhook);
		const embed = new MessageBuilder();
		embed.setTitle("Updating game: " + game.displayName);
		embed.setColor(0x0000FF);
		if (config.discordWebhookConfig.pingForGameProgress) {
			embed.setText(config.discordWebhookConfig.pings);
		}
		if (game.thumbnail != null) {
			embed.setImage(game.thumbnail);
		}
		embed.addField("Progress", index + " / " + total);
		embed.addField("Install directory", (game.customSteamDirectory == null ? config.steamPath : game.customSteamDirectory));
		embed.addField("Account", accountName);
		embed.setTimestamp();
		embed.setThumbnail(DiscordWebhookUtils.THUMBNAIL);
		await webhook.send(embed);
	}

	static async sendUpdateErrorMessage(config: SteamUpdaterConfig) {
		const webhook = new Webhook(config.discordWebhookConfig.webhook);
		const embed = new MessageBuilder();
		if (config.discordWebhookConfig.pings.trim().length > 0) {
			embed.setText(config.discordWebhookConfig.pings);
		}
		embed.setTitle("An error occured while updating games");
		embed.setDescription("An exception occured while running update. Please check the state of steamupdater, fix any potential config erros and try again");
		embed.setColor(0xFF0000);
		embed.setTimestamp();
		embed.setThumbnail(DiscordWebhookUtils.THUMBNAIL);
		await webhook.send(embed);
	}

	static async sendErrorStateMessage(config: SteamUpdaterConfig) {
		const webhook = new Webhook(config.discordWebhookConfig.webhook);
		const embed = new MessageBuilder();
		if (config.discordWebhookConfig.pings.trim().length > 0) {
			embed.setText(config.discordWebhookConfig.pings);
		}
		embed.setTitle("Cant start update");
		embed.setDescription("Steam updater is in a non ready state. Please check the application for more details about the error");
		embed.setColor(0xFF0000);
		embed.setTimestamp();
		embed.setThumbnail(DiscordWebhookUtils.THUMBNAIL);
		await webhook.send(embed);
	}

	static async sendFinishMessage(config: SteamUpdaterConfig, updateCount: number) {
		const webhook = new Webhook(config.discordWebhookConfig.webhook);
		const embed = new MessageBuilder();
		if (config.discordWebhookConfig.pings.trim().length > 0) {
			embed.setText(config.discordWebhookConfig.pings);
		}
		embed.setTitle("Update completed");
		embed.setDescription(updateCount + " games where processed");
		embed.setColor(0x00FF00);
		embed.setTimestamp();
		embed.setThumbnail(DiscordWebhookUtils.THUMBNAIL);
		await webhook.send(embed);
	}
}