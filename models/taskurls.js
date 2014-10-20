/**
 * Created by nant on 2014/8/22.
 */
module.exports = function(sequelize, DataTypes){
	var TaskUrls = sequelize.define( 'TaskUrls', {
		url:{ type:DataTypes.STRING(255), allowNull:false}
	},{
		timestamps: true,
		comment: "task urls",
		engine: 'MYISAM'
	} );
	return TaskUrls;
}