global.config = require('./config.json')

const readline = require('readline');
const db = require('./shared/db.js');
const fs = require('fs');
const chalk = require('chalk');

const logoFile = fs.readFileSync('./ascii.txt').toString();
const logoArr = logoFile.split('\n')

console.log()
for (var i = 0; i < logoArr.length; i++) {
	console.log(logoArr[i])
}
console.log()

// Initialising readline interpretor
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Asking question
rl.question('Enter your one word search query: ', async (output) => {

	// Initialising Variables
	let arr = [];
	
	// Formatting input
	const answer = output.toLowerCase();

	// Getting pages from DB
	const res = await db.getPagesByString(answer);

	// Looping through pages
	for (var i = res.length - 1; i >= 0; i--) {

		// Counting query hits in page
		res[i].hits = 0;
		for (var j = 0; j < res[i].tags.length; j++) {
			if (res[i].tags[j].includes(answer)) res[i].hits += 1;
		}

		// Getting relative score
		// (Hits / Word Count)
		res[i].score = (res[i].hits / res[i].tags.length)

		// Pushing data to final array
		arr.push({
			url: res[i].url,
			score: res[i].score,
			hits: res[i].hits,
			title: res[i].title
		})
	}

	// Sorts array by relative score
	arr.sort(function(a, b){return b.score - a.score});

	// Logging output
	console.log(`Search returned ${arr.length} result(s).\n`)
	for (var i = 0; i < arr.length; i++) {
		// Return limit
		if (i >= global.config.limit) break;
		console.log((i + 1) + '. ' + chalk.bgYellow(arr[i].title));
		console.log(chalk.underline(arr[i].url))
		console.log(chalk.grey(`Relative Page Score: ${res[i].score} | Query Hits: ${arr[i].hits}\n`))
	}
	if (arr.length !== 0) console.log(`\nSearch returned ${arr.length} result(s).`)
	process.exit(0)
})
