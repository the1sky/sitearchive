var express = require( 'express' );
var router = express.Router();
var _ = require( 'lodash' );
var db = require( './../models' );

/* GET home page. */
router.get( '/add', function(req, res){
	var url = req.param( 'url' );
	if( url ){
		db.Urls.create( {url:url} );
	}
	res.json( null )
} );

router.post( '/add', function(req, res){
	var body = req.body;
	if( body.url ){
		var toSave = {
			url:body.url
		};
		db.Urls.create( toSave ).complete( function(err, dbRes){
			if( !err ){
				res.json( {code:0} );
			}else{
				res.json( {code:err['errno']} );
			}
		} );
	}
} );

router.post( '/get', function(req, res){
	var data = [];

	db.Urls.findAll( {groupBy:'url'} ).success( function(dbRes){
		_.forEach( dbRes, function(val, index){
			data.push( val.dataValues );
		} );
		res.json( {code:0, data:data} );
	} ).error( function(err){
		res.json( {code:err['errno']} );
	} );
} );

module.exports = router;