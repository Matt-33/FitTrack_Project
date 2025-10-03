export function getWeekBounds(date = new Date()) {
	const d = new Date(date);
	const day = d.getDay();
	const diffToMonday = (day + 6) % 7;
	const start = new Date(d);
	start.setDate(d.getDate() - diffToMonday);
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(start.getDate() + 7);
	end.setHours(0, 0, 0, 0);
	return { start, end };
}
