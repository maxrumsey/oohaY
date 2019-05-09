# oohaY

**What is oohaY?**
oohaY is a web scraper and a search engine.

**What does oohaY require?**
oohaY requires a MongoDB database and the latest version of Node. Oh, and whatever's installed by `npm install`.

**How do I install oohaY?**
1. Run `npm install`.
2. Edit `config.json`. See: `How do I change the config?`
3. Scrape with `node worker.js`
4. Search with `node searcher.js`

**How do I change the config?**
Config file format:
```JSON
{
	"level": 2, // - The log level. 0: Absolutely nothing. 1: Start and stop. 2: Verbose. 3: Debug.
	"db": "mongodb://localhost:27017/oohaY", // - The MongoDB connection string. 
	"prefix": "https://maxrumsey.xyz", // - The website the crawler will limit itself to. Replace with `undefined` to ignore this limit.
	"base": "https://maxrumsey.xyz/index.html" // - Page to start crawling on.
}
```