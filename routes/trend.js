var express = require( 'express' );
var router = express.Router();
var _ = require( 'lodash' );
var db = require( './../models' )
var moment = require( 'moment' )
var metrics_trend = require( './../models/metrics_trend.js' );

router.get( '/', function(req, res){
	var response = res;
	var data = [];
	db.Perf.findAll( {attributes:['url'], group:'url'} ).success( function(res){
		_.forEach( res, function(val, index){
			data.push( val.dataValues );
		} );
		response.render( 'trend', { title:'site archive', data:data, metrics:metrics_trend.metrics} );
	} ).error( function(err){
		response.render( 'error', {} );
	} );
} );

router.post( '/query', function(req, res){
	var body = req.body;
	if( body.start && body.end ){
		var startDate = moment( body.start ).format( 'YYYYMMDD' );
		var endDate = moment( body.end ).format( 'YYYYMMDD' );
		var output = [];

		var selectItems = "select ";
		var whereItems = "where ";

		_.forEach( metrics_trend.metrics, function(item, index){
			selectItems += 'avg( ' + item.name + ') as ' + item.name + ',';
			whereItems += item.name + '>= 0 and ';
		} );
		selectItems += 'day,runstep ';

		var sql = selectItems + ' from Perves ' + whereItems + ' day between ' + startDate + ' and ' + endDate +
			' group by day,runstep order by day ASC;';

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
