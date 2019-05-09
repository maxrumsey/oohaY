const mongoose = require('mongoose');
mongoose.connect(global.config.db, {useNewUrlParser: true});

exports.page = mongoose.model('Page', {
	url: String,
	tags: [String],
	title: String
});

exports.scheduled = mongoose.model('Scheduled', {
	url: String
})
/*
 * Indexed Pages
 */
exports.getPagesByString = str => {
	return new Promise((res, rej) => {
		exports.page.find({tags: str}, (e, docs) => {
			if (e) rej(e);
			else res(docs)
		})
	})
}
exports.getPage = id => {
	return new Promise((res, rej) => {
		exports.page.findOne({_id: id}, (e, doc) => {
			if (e) rej(e);
			else res(doc)
		})
	})
}
exports.getPageByURL = url => {
	return new Promise((res, rej) => {
		exports.page.findOne({url: url}, (e, doc) => {
			if (e) rej(e);
			else res(doc)
		})
	})
}
exports.getAllPages = () => {
	return new Promise((res, rej) => {
		exports.page.find({}, (e, docs) => {
			if (e) rej(e);
			else res(docs)
		})
	})
}
exports.createPage = doc => {
	return new Promise((res, rej) => {
		exports.page.create(doc, e => {
			if (e) rej(e);
			else res()
		})
	})
}
/*
 * Scheduled Pages
 */
exports.getScheduled = id => {
	return new Promise((res, rej) => {
		exports.scheduled.findOne({_id: id}, (e, doc) => {
			if (e) rej(e);
			else res(doc)
		})
	})
}
exports.getScheduledByURL = url => {
	return new Promise((res, rej) => {
		exports.scheduled.findOne({url: url}, (e, doc) => {
			if (e) rej(e);
			else res(doc)
		})
	})
}
exports.deleteScheduled = id => {
	return new Promise((res, rej) => {
		exports.scheduled.deleteOne({_id: id}, e => {
			if (e) rej(e);
			else res()
		})
	})
}
exports.getAllScheduleds = () => {
	return new Promise((res, rej) => {
		exports.scheduled.find((e, docs) => {
			if (e) rej(e);
			else res(docs)
		})
	})
}
exports.createScheduled = doc => {
	return new Promise((res, rej) => {
		exports.scheduled.create(doc, e => {
			if (e) rej(e);
			else res()
		})
	})
}