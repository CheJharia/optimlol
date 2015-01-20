var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SummonersSchema = new Schema({
	summonerName: { type: String, required: true },
	region: { type: String, required: true },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

SummonersSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	this.summonerName = this.summonerName.replace(/ /g, '').toLowerCase();
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

module.exports = mongoose.model('summoners', SummonersSchema);