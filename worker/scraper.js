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

			if (obj.scheduleds.includes(push)) continue;
			if (global.level == 3) console.log('Pushing URL: ' + push.url)
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
function buildLocalUrl(original, addition) {
	const url = urlMod.parse(original);
	const prebase = url.host;
	let base;
	if (url.pathname[url.pathname.length - 1] == '/' || url.pathname == '') {
		base = url.pathname + '/'
	} else {
		base = url.pathname.split('/')
		base.pop();
		base = base.join('/') + '/';
	}
	base = base.replace(/\/\//g, '/')
	return (url.protocol + '//' + prebase + base + addition);
}