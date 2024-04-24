export const sleep = (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

export const mcTimeToHRT = (tickTime: number) => {
	const ratio = 1000 / 60;
	const t = Math.floor((tickTime + 6000) % 24000);
	const hour = Math.floor(t / 1000);
	const minute = Math.floor((t % 1000) / ratio);
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const getTimeStamp = () => {
	return new Date().toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, {
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
		second: '2-digit',
	});
};

export const getDateStamp = () => {
	const tzoffset = new Date().getTimezoneOffset() * 60000;
	return new Date(Date.now() - tzoffset).toISOString().split('T')[0];
};
