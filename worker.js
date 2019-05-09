const db = require('./shared/db.js');
const scraper = require('./worker/scraper.js')
/*
 * Config Variables
 */
global.level = 2;
global.prefix = 'https://wavets.com.au'

async function loop(override) {
	let scheduled = [];
	let prelist;
	
	// ToDo list override
	if (!override) prelist = await db.getAllScheduleds();
	else prelist = override;

	/*
	 * Checking for overwrites
	 */
	for (var i = prelist.length - 1; i >= 0; i--) {
		if (await db.getPageByURL(prelist[i].url)) {
			await db.deleteScheduled(prelist[i]._id);
		} else {
			scheduled.push(prelist[i])
		}
	}
	if (scheduled.length === 0) {
		console.log('List of websites to index is empty.')
		process.exit(0);
	}
	// Scraping websites. Returns indexed pages and new todo.
	const { indexeds, scheduleds } = await scraper(scheduled);
	// Deleting indexed pages from the DB todo list.
	for (var i = scheduled.length - 1; i >= 0; i--) {
		await db.deleteScheduled(scheduled[i]._id);
	}
	// Adding indexed pages to the DB
	for (var i = indexeds.length - 1; i >= 0; i--) {
		await db.createPage(indexeds[i]);
	}
	// Adding links to the DB todo list.
	for (var i = scheduleds.length - 1; i >= 0; i--) {
		if (await db.getScheduledByURL(scheduleds[i].url)) continue;
		await db.createScheduled(scheduleds[i]);
	}
	// Repeats
	loop()
}

if (global.level >= 1) console.log(`${buildTimeStamp()} Beginning search.`)

loop([{url: 'https://wavets.com.au/'}]);

function buildTimeStamp() {
	const date = (new Date()) + ''

	return date.split(' ')[4]
}