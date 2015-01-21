var q = require('q');

module.exports = function() {
	var self = this;
	var _summonerDataProvider = null;
	var _statsDataProvider = null;

	var _verifySummoner = function(region, summonerName) {
		var deferred = q.defer();
		_summonerDataProvider.getSummonerByName(region, summonerName)
			.then(function(summonerResult) {
				var resolvedObject = {
					verified: false,
					summoner: {}
				}

				if (summonerResult.length === 0) {
					deferred.resolve(resolvedObject);
				} else {
					var summonerExists = false;
					for(var x = 0; x < summonerResult.length; x++) {
						if (summonerResult[x].queriedName === summonerName.replace(/ /g, '').toLowerCase()) {
							resolvedObject.verified = true;
							resolvedObject.summoner = summonerResult[x];
						}
					}

					deferred.resolve(resolvedObject);
				}
			})
			.fail(function(error) {
				deferred.reject(resolvedObject);
			});

		return deferred.promise;
	};

	var _getStats = function(region, summonerId) {
		var promiseObject = {
			STATS_INDEX: 0,
			CHAMPS_INDEX: 1,
			PRMOMISES: [
				_statsDataProvider.getRankedStats(region, summonerId),
				_staticDataProvider.getStaticData(region, 'champions')
			]
		};
		var deferred = q.defer();
		q.allSettled(promiseObject.PRMOMISES)
			.then(function(results) {
				var haveStats = true;
				if (results[promiseObject.STATS_INDEX].state === 'fulfilled') {
					var championStats = results[0].value;
					if (championStats.data) {
						championStats.data.champions.forEach(function(championStat, index) {
							// we get data back with string id's le sigh....
							var championIdString = championStat.id.toString();
							if (championIdString !== "0") {
								championStat.championName = results[1].value.data.data[championIdString].name;
							} else {
								championStats.allChampIndex = index;
								championStat.championName = "All";
							}
						});
					}
					deferred.resolve(championStats);
				} else {
					deferred.resolve({ success: false, data: null });
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	var _getMatchHistory = function(region, summonerId, championId) {

	};

	var _generatePerformanceData = function(region, summoner) {
		var deferred = q.defer();
		_getStats(region, summoner.id)
			.then(function(championStats) {
				if (championStats.success) {
					if (championStats.allChampIndex) {
						summoner.totalStats = championStats.data.champions[championStats.allChampIndex];
						championStats.data.champions.splice(championStats.allChampIndex, 1);
					}

					summoner.championStats = championStats.data ? championStats.data.champions : null;
				}

				deferred.resolve(summoner);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
		// var promises = [_getStats(region, summoner.id), _getMatchHistory(region, summoner.id)];
		// var deferred = q.defer();
		// q.allSettled(promises)
		// 	.then(function(results) {
		// 	})
		// 	.fail(function(error) {
		// 		deferred.reject(error);
		// 	})
	};

	self.generateSummonerData = function(region, summonerName) {
		var deferred = q.defer();
		_verifySummoner(region, summonerName)
			.then(function(verifiedSummoner) {
				if (verifiedSummoner.verified) {
					_generatePerformanceData(region, verifiedSummoner.summoner)
						.then(function(summonerWithPerformanceData) {
							deferred.resolve(summonerWithPerformanceData);
						})
						.fail(function(error) {
							deferred.reject(error);
						});
				} else {
					deferred.resolve(verifiedSummoner);
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.init = function() {
		var SummonerDataProvider = require('../persistence/dataProviders/summonerDataProvider');
		_summonerDataProvider = new SummonerDataProvider();
		_summonerDataProvider.init();

		var StatsDataProvider = require('../persistence/dataProviders/statsDataProvider');
		_statsDataProvider = new StatsDataProvider();
		_statsDataProvider.init();

		var StaticDataProvider = require('../persistence/dataProviders/staticDataProvider');
		_staticDataProvider = new StaticDataProvider();
		_staticDataProvider.init();
	}
};