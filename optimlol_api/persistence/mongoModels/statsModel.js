var mongoose = require('mongoose');
var q = require('q');

var Schema = mongoose.Schema;

var StatsSchema = new Schema({
	summonerId: { type: String, required: true },
	region: { type: String, required: true },
	expiredTimeMinutes: { type: Number, default: 60 },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

StatsSchema.statics.retrieve = function(identifiers) {
	var deferred = q.defer();
	this.model('stats').findOne(identifiers, function(error, result) {
		if (error) deferred.reject(error);
		else {
			deferred.resolve(result);
		}
	});

	return deferred.promise;
}

StatsSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

module.exports = mongoose.model('stats', StatsSchema);