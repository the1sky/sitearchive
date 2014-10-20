/**
 * Created by nant on 9/25/2014.
 */
var db = require( './../models' );
var path = require('path');

var lineReader = require( 'line-reader' );
lineReader.eachLine( path.resolve(__dirname,'./all'), function(line, last){
	var re=/\n/;
	line=line.replace(re,"");
	console.log(line);
	return;
	db.Urls.create({url:line} ).success(function(res){
	}).error(function(res){
		console.log(res);
	});
} );