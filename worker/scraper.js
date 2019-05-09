const axios = require('axios');
const cheerio = require('cheerio');
const urlMod = require('url');

module.exports = async scheduled => {
	if (global.level >= 2) console.log(`${buildTimeStamp()} Crawl beginning. Crawling ${scheduled.length} page(s).`)
	const obj = { indexeds: [], scheduleds: [] }
	
	for (var i = scheduled.length - 1; i >= 0; i--) {
		let page;
		try {
			page = await axios.get(scheduled[i].url)
		} catch (e) {
			continue;
		}

		const $ = cheerio.load(page.data);
		let title;
		if ($('title')) title = $('title').text();
		else title = url;

		if (global.level == 3) console.log(`Crawling page: ${title}`);

		let text = $.text().toLowerCase();
		text = text.replace(/\n/g, '')
		text = text.replace(/\t/g, '')
		text = text.split(' ')
		for (var t = text.length - 1; t >= 0; t--) {
			if (text[t] === '') text.splice(t, 1)
		}

		obj.indexeds.push({url: scheduled[i].url, tags: text, title: title})
		const a = $('a');
		for (var j = a.length - 1; j >= 0; j--) {
			const url = a[j].attribs.href;
			if (!url) continue;
			const origUrl = urlMod.parse(scheduled[i].url).host
			const https = scheduled[i].url.startsWith('https://')
			let push;
			if (url == '#') continue;
			else if (!url.startsWith('http')) continue;
			else if (global.prefix && !url.startsWith(global.prefix)) continue;
			else if (url.includes('.jpg')) continue;
			else if (url.includes('.jpeg')) continue;
			else if (url.includes('.png')) continue;
			else if (url.includes('.gif')) continue;
			else if (url.includes('.tiff')) continue;
			else if (url.includes('.tif')) continue;
			else if (url == '/') push = ({url: buildURL(origUrl, https)})
			else if (url.startsWith('/')) push = ({url: buildURL(origUrl, https, url)})
			else push = ({url});

			if (obj.scheduleds.includes(push)) continue;
			obj.scheduleds.push(push)
		}
	}
	if (global.level == 3) console.log(obj)
	if (global.level >= 2) console.log(`${buildTimeStamp()} Crawl done. Returned ${obj.indexeds.length} indexed record(s).`)
	if (global.level >= 2) console.log(`${buildTimeStamp()} Added ${obj.scheduleds.length} record(s) to the queue.`)
	return obj
}
function buildURL(origUrl, https, addition = '/') {
	return ((https ? 'https://' : 'http://') + origUrl + addition) 
}
function buildTimeStamp() {
	const date = (new Date()) + ''

	return date.split(' ')[4]
}