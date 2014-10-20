/**
 * run pagetimeline,cron
 * save performace report
 *
 * Created by nant on 2014/8/24.
 */

var ptModule = require( 'pagetimeline' );
var lodash = require( 'lodash' );
var db = require( './../models' );
var moment = require( 'moment' );
var CronJob = require( 'cron' ).CronJob;
var path = require( 'path' );
var logger = require( '../log' ).logger;

var runing = false;
var runstep = 1;
var ptConfig = path.resolve( __dirname, '../config/pagetimeline.json' );
var pt = new ptModule( {config:ptConfig} );

pt.on( 'report', function(res){
	var result = JSON.parse( res );

	runstep = result['runstep']

	var report = {};
	report['url'] = result['url'];
	report['runstep'] = runstep;
	report['uid'] = result['uid'];
	report['platform'] = result['platform'];
	report['browser'] = result['browser'];
	report['day'] = moment( result['timestamp'] ).format( 'YYYYMMDD' );

	var metrics = result['metrics'];
	lodash.forEach( metrics, function(metricValue, metricKey){
		if( metricKey == 'timing' ) return;
		report[metricKey] = metricValue;
	} );

	db.Perf.create( report ).error( function(res){
		logger.info( res );
	} );
} );

pt.on( 'error', function(res){
	logger.error( res );
	deleteTaskUrl();
	runing = false;
} );

pt.on( 'end', function(res){
	logger.info( 'end' );
	deleteTaskUrl();
	runing = false;
} );

var deleteTaskUrl = function(){
	db.TaskUrls.find( { limit:1 } ).success( function(res){
		res.destroy().on( 'success', function(u){
			if( u && u.deletedAt ){
			}
		} );
	} ).error( function(res){
		logger.info( res );
	} );
}

var getTaskUrl = function(callback){
	db.TaskUrls.find( { limit:1 } ).complete( function(err, res){
		if( !err && res && res.dataValues ){
			var dataValues = res.dataValues;
			callback( dataValues.url );
		}else{
			callback( '' );
		}
	} );
}

var addTaskUrl = function(){
	db.Urls.findAll().success( function(res){
		lodash.forEach( res, function(item, index){
			var rowData = item.dataValues;
			db.TaskUrls.create( {url:rowData['url']} ).success( function(res){
			} ).error( function(res){
				logger.info( res );
			} );
		} );
	} ).error( function(res){
		logger.info( res );
	} );
}

//pagetimeline定时任务,每20s
var pagetimelineCronJob = new CronJob( '*/20 * * * * *', function(){
	if( !runing ){
		runing = true;
		runstep = 1;
		getTaskUrl( function(url){
			logger.info( url );
			if( url ){
				pt.changeUrl( url );
				pt.start();
			}
		} );
	}
}, null, true, "Asia/Shanghai" );

//创建任务url定时任务，每天
var addTaskUrlCronJob = new CronJob( '* * 0 * * *', function(){
	addTaskUrl();
}, null, true, "Asia/Shanghai" );

module.exports = lodash.extend( {
	schedule:pagetimelineCronJob,
	pagetimeline:pt
} );

