var _ = require( 'lodash' );
var db = require( './../models' );
var moment = require('moment');

var t = moment('2014-08-23');
console.log( t.format('YYYYMMDD'))
console.log(new Date('2014-08-23 19:59:45' ).format("yyyy-MM-dd") );
return;
var urls = [];
var t = db.Perf.describe().success(function(res){
	_.forEach( res, function(val,key){
		if( !/offender|browser|createAt|updateAt|runstep|uid|id|url|platform/.test(key)){
			console.log('sum(' + key + ')');
		}
	});
});
db.Perf
	.find( {order:'timestamps DESC'} )
	.success( function(res){
		console.log(res);
		_.forEach( res, function(val,index){
			var url = val.dataValues.url;
		});
	} )
	.error( function(err){
	} );

db.Perf.sum( '*', {attributes:['first_screen_time', 'white_screen_time', 'load_time', 'timing_ttfb', 'timing_dns'], where:{'url':'http://www.pconline.com.cn'}} ).success( function(res){
		_.forEach( res, function(val, index){
			data.push( val.dataValues );
		} );
	} ).error( function(err){
	} );

