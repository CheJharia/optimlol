var mongoose = require('mongoose');
var q = require('q');

var Schema = mongoose.Schema;

var SummonersSchema = new Schema({
	summonerName: { type: String },
	summonerId: { type: Number },
	region: { type: String },
	expiredTimeMinutes: { type: Number, default: -1 },
	returnDataOnExpired: { type: Boolean, required: true, default: false },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

// every model should have a retrieve function that does any
// special things necessary to get the proper data.
// most of the time...this isn't an issue so really, we're using retrieve 
// so we can always have a promise :)
SummonersSchema.statics.retrieve = function(identifiers) {
	if (identifiers.summonerName) {
		identifiers.summonerName = identifiers.summonerName.replace(/ /g, '').toLowerCase();
	} 

	if (identifiers.summonerId) {
		identifiers.summonerId = parseInt(identifiers.summonerId)
	}

	var deferred = q.defer();
	this.model('summoners').findOne(identifiers, function(error, result) {
		if (error) deferred.reject(error);
		else {
			deferred.resolve(result);
		}
	});

	return deferred.promise;
}

SummonersSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	this.summonerName = this.summonerName.replace(/ /g, '').toLowerCase();
	this.summonerId = this.data[this.summonerName].id;

	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

// mongoose makes collections plural if we don't specify an name in third parameter :[
// this one is already plural but I like consistency.
module.exports = mongoose.model('summoners', SummonersSchema, 'summoners');