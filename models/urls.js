/**
 * Created by nant on 2014/8/22.
*/
module.exports = function(sequelize, DataTypes){
	var Urls = sequelize.define( 'Urls', {
		url:{ type:DataTypes.STRING(255), allowNull:false, unique:true}
	},{
		timestamps: true,
		comment: "urls",
		engine: 'MYISAM'
	} );
	return Urls;
}