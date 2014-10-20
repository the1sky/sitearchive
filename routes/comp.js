var express = require( 'express' );
var router = express.Router();
var _ = require( 'lodash' );
var moment = require( 'moment' )
var db = require( './../models' );
var metrics_trend = require( './../models/metrics_trend.js' );

router.get( '/', function(req, res){
	var response = res;
	var data = [];

	db.Perf.findAll( {attributes:['url'], group:'url'} ).success( function(res){
		_.forEach( res, function(val, index){
			data.push( val.dataValues );
		} );
		response.render( 'comp', { title:'site archive', data:data, metrics:metrics_trend.metrics} );
	} ).error( function(err){
		response.render( 'error', {} );
	} );
} );

router.post( '/query', function(req, res){
	var body = req.body;
	if( body.url && body.compurl ){
		var startDate = moment( body.start ).format( 'YYYYMMDD' );
		var endDate = moment( body.end ).format( 'YYYYMMDD' );

		var output = [];

		var selectItems = "select ";
		var whereItems = "where ";

		_.forEach( metrics_trend.metrics, function(item, index){
			selectItems += 'avg( ' + item.name + ') as ' + item.name + ',';
			whereItems += item.name + '>= 0 and ';
		} );
		selectItems += 'day,runstep,url ';

		var sql = selectItems + ' from Perves ' + whereItems + ' day between ' +
			startDate + ' and ' + endDate + ' and url="' + body.url + '" or url="' + body.compurl + '" ' +
			' group by day,url,runstep order by day ASC;';

		db.sequelize.query( sql, db.Perf ).success( function(dbRes){
			_.forEach( dbRes, function(value, key){
				output.push( value );
			} );
			res.json( {code:0, data:output} )
		} ).error( function(err){
			res.json( {code:-1, data:null} );
		} );
	}
} );

module.exports = router;
