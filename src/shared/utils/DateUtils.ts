export default class DateUtils {
	static formatDateDifference(startDate: any, endDate: any): string {
		const timeDifference = Math.abs(endDate - startDate) / 1000; // in seconds

		const days = Math.floor(timeDifference / 86400); // 1 day = 24 * 60 * 60 seconds
		const hours = Math.floor((timeDifference % 86400) / 3600);
		const minutes = Math.floor((timeDifference % 3600) / 60);
		const seconds = Math.floor(timeDifference % 60);

		const formattedParts = [];

		if (days > 0) {
			formattedParts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
		}
		if (hours > 0 || days > 0) {
			formattedParts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
		}
		if (minutes > 0 || hours > 0 || days > 0) {
			formattedParts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
		}

		formattedParts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);

		return formattedParts.join(' ');
	}

	static isTimeInPast(timeString: string): boolean {
		const currentTime = new Date();
		const [hours, minutes, seconds] = timeString.split(":").map(Number);

		const targetTime = new Date();
		targetTime.setHours(hours, minutes, seconds, 0);

		return currentTime.getTime() > targetTime.getTime();
	}

	static getDayNumber(): number {
		return new Date().getDay();
	}
}