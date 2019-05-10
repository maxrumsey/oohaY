const axios = require('axios');
const cheerio = require('cheerio');
const urlMod = require('url');

/*
 * Async Main Function / Export
 */
module.exports = async scheduled => {
	// Logging
	if (global.level >= 2) console.log(`${buildTimeStamp()} Crawl beginning. Crawling ${scheduled.length} page(s).`)

	// Initialising variables
	const obj = { indexeds: [], scheduleds: [] }

	// Looping through peges
	for (var i = scheduled.length - 1; i >= 0; i--) {
		let page;
		let $;
		let title;
		// Fetching data, 
		loading it into Cheerio
		try {
			page = await axios.get(scheduled[i].url)
			$ = cheerio.load(page.data)
		} catch (e) {
			continue;
		}

		// Determining title
		if ($('title')) title = $('title').text();
		else title = url;

		// Logging
		if (global.level == 3) console.log(`Crawling page: ${title}`);

		// Getting text (tags in the DB)
		let text = $.text().toLowerCase();
		text = text.replace(/\n/g, '')
		text = text.replace(/\t/g, '')
		text = text.split(' ')
		for (var t = text.length - 1; t >= 0; t--) {
			if (text[t] === '') text.splice(t, 1)
		}

		// Pushing url, title and text to output
		obj.indexeds.push({url: scheduled[i].url, tags: text, title: title})

		// Getting links
		const a = $('a');

		// Looping through links
		for (var j = a.length - 1; j >= 0; j--) {

			// Getting URL from specific link
			const url = a[j].attribs.href;
			if (!url) continue;

			// Initialising variables
			const origUrl = urlMod.parse(scheduled[i].url).host
			const https = scheduled[i].url.startsWith('https://')
			let push;

			// Link formatter / filter
			if (url == '#') continue;
			else if (global.prefix && url.startsWith('http') && !url.startsWith(global.prefix)) continue;
			else if (url.includes(':') && (!url.startsWith('https://') && !url.startsWith('http://'))) continue;
			else if (url.includes('#')) push = ({url: url.split('#')[0]})
			else if (url.includes('.jpg')) continue;
			else if (url.includes('.jpeg')) continue;
			else if (url.includes('.png')) continue;
			else if (url.includes('.gif')) continue;
			else if (url.includes('.tiff')) continue;
			else if (url.includes('.tif')) continue;
			else if (url.includes('tel:')) continue;
			else if (url == '/') push = ({url: buildURL(origUrl, https)})
			else if (url.startsWith('/')) push = ({url: buildURL(origUrl, https, url)})
			else if (url.startsWith('http')) push = ({url});
			else push = ({url: buildLocalUrl(scheduled[i].url, url)})

			// Checking to see if URL is unique
			if (obj.scheduleds.includes(push)) continue;

			// Logging
			if (global.level == 3) console.log('Pushing URL: ' + push.url)

			// Pushing URL
			obj.scheduleds.push(push)
		}
	}
	// Logging once done
	if (global.level == 3) console.log(obj)
	if (global.level >= 2) console.log(`${buildTimeStamp()} Crawl done. Returned ${obj.indexeds.length} indexed record(s).`)
	if (global.level >= 2) console.log(`${buildTimeStamp()} Added ${obj.scheduleds.length} record(s) to the queue.`)
	return obj
}

/*
 * Building URL
 */
function buildURL(origUrl, https, addition = '/') {
	return ((https ? 'https://' : 'http://') + origUrl + addition) 
}

/*
 * Building Timestamp for logging
 */
function buildTimeStamp() {
	const date = (new Date()) + ''

	return date.split(' ')[4]
}

/*
 * Building local URL
 */
function buildLocalUrl(original, addition) {

	// Initialising Variables
	const url = urlMod.parse(original);
	const prebase = url.host;
	let base;

	// Formatting URLs
	if (url.pathname[url.pathname.length - 1] == '/' || url.pathname == '') {
		base = url.pathname + '/'
	} else {
		base = url.pathname.split('/')
		base.pop();
		base = base.join('/') + '/';
	}

	// Removing double slashes.
	base = base.replace(/\/\//g, '/')

	// Outputting URL
	return (url.protocol + '//' + prebase + base + addition);
}