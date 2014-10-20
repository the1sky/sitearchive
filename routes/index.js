var express = require( 'express' );
var router = express.Router();
var _ = require( 'lodash' );

/* GET home page. */
router.get( '/', function(req, res){
	res.render( 'index', {
		title:'site archive'
	} );
} )

module.exports = router;