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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your one word search query: ', async (output) => {
	let arr = [];
	const answer = output.toLowerCase();
	const res = await db.getPagesByString(answer);
	for (var i = res.length - 1; i >= 0; i--) {
		res[i].hits = 0;
		for (var j = 0; j < res[i].tags.length; j++) {
			if (res[i].tags[j].includes(answer)) res[i].hits += 1;
		}
		res[i].score = (res[i].hits / res[i].tags.length)
		arr.push({
			url: res[i].url,
			score: res[i].score,
			hits: res[i].hits,
			title: res[i].title
		})
	}

	arr.sort(function(a, b){return b.score - a.score});
	console.log(`Search returned ${arr.length} result(s).\n`)
	for (var i = 0; i < arr.length; i++) {
		if (i >= global.config.limit) break;
		console.log((i + 1) + '. ' + chalk.bgYellow(arr[i].title));
		console.log(chalk.underline(arr[i].url))
		console.log(chalk.grey(`Relative Page Score: ${res[i].score} | Query Hits: ${arr[i].hits}\n`))
	}
	if (arr.length !== 0) console.log(`\nSearch returned ${arr.length} result(s).`)
	process.exit(0)
})
