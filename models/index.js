/**
 * Created by nant on 2014/8/21.
 */
var fs = require( 'fs' );
var path = require( 'path' );
var Sequelize = require( 'sequelize' );
var lodash = require( 'lodash' );
var logger = require( '../log' ).logger;
var dbConfig = {};
var db = {};

try{
	dbConfig = JSON.parse( fs.readFileSync( path.resolve( __dirname, '../config/mysql.json') ) );
}catch( ex ){
	dbConfig = {
		"database":"ppas",
		"port":3306,
		"user":"root",
		"pwd":""
	}
}

var sequelize = new Sequelize( dbConfig.database, dbConfig.user, dbConfig.pwd, {
	dialect:'mysql',
	port:dbConfig.port
} );

sequelize.authenticate().complete( function(err){
	if( !!err ){
		logger.error( 'Unable to connect to the database:', err )
	}else{
		logger.info( 'Connection has been established successfully.' )
	}
} )

fs.readdirSync( __dirname ).filter( function(file){
	return (file.indexOf( '.' ) !== 0) && (file !== 'index.js') && (file !== 'metrics_trend.js')
} ).forEach( function(file){
	var model = sequelize.import( path.join( __dirname, file ) )
	db[model.name] = model
} )

Object.keys( db ).forEach( function(modelName){
	if( 'associate' in db[modelName] ){
		db[modelName].associate( db )
	}
} )

sequelize.sync().complete( function(err){
	if( err ){
		throw err[0]
	}
} );

module.exports = lodash.extend( {
	sequelize:sequelize,
	Sequelize:Sequelize
}, db );
