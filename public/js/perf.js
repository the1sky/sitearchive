/**
 * Created by nant on 2014/8/29.
 */
/* Table initialisation */
$( document ).ready( function(){
	/**
	 * 回到顶部
	 */
	$.goup( {
		trigger:100,
		bottomOffset:50,
		locationOffset:20,
		title:'回到顶部',
		titleAsText:true
	} );

	/**
	 * 获取request中的url
	 *
	 * @param name
	 * @returns {*}
	 */
	$.getUrlParam = function(name){
		var reg = new RegExp( "(^|&)" + name + "=([^&]*)(&|$)" );
		var r = window.location.search.substr( 1 ).match( reg );
		if( r != null ) return unescape( r[2] );
		return null;
	}

	/**
	 *  获取相对于今天的日期格式，"2014-09-16
	 *
	 * @param addDayCount
	 * @param dateStr
	 * @returns {string}
	 */
	$.getDateStr = function(addDayCount, dateStr){
		var dd = dateStr ? new Date( dateStr ) : new Date();
		dd.setDate( dd.getDate() + addDayCount );//获取AddDayCount天后的日期
		var y = dd.getFullYear();
		var m = dd.getMonth() + 1;//获取当前月份的日期
		var d = dd.getDate();
		return y + "-" + m + "-" + d;
	}

	/**
	 *  获取趋势数据
	 *
	 * @param url
	 * @param startDate
	 * @param endDate
	 * @param callback
	 */
	$.getTrendData = function(startDate, endDate, callback){
		var re = /\n$/;
		$.ajax( {
			'url':'/trend/query',
			'type':'post',
			'data':{start:startDate, end:endDate},
			'complete':function(res){
				callback( res.responseJSON );
			}
		} );
	}

	/**
	 *  获取对比数据
	 *
	 * @param url
	 * @param compUrl
	 * @param startDate
	 * @param endDate
	 * @param callback
	 */
	$.getCompData = function(url, compUrl, startDate, endDate, callback){
		if( url && compUrl ){
			$.ajax( {
				'url':'/comp/query',
				'type':'post',
				'data':{url:url, compurl:compUrl, start:startDate, end:endDate},
				'complete':function(res){
					callback( res.responseJSON || {code:-1} );
				}
			} );
		}
	}

	//获取url列表
	$.getUrlList = function(callback){
	}

	//滚动到
	$.scrollTo = function(id){
		var scroll_offset = $( "#" + id ).offset();
		$( "body,html" ).animate( {
			scrollTop:scroll_offset.top
		}, 0 );
	}

	/**
	 * 添加url
	 *
	 */
	$( '#addurl button:first' ).on( 'click', function(e){
		addurlProc();
	} );
	$( '#addurl input:first' ).bind( 'keydown', function(e){
		if( e.keyCode == 13 ){
			addurlProc();
		}
	} );
	var addurlProc = function(){
		var url = $( '#addurl input:first' ).val();
		$.ajax( {
			'url':'/urls/add',
			'type':'post',
			'data':{url:url},
			'complete':function(res){
				var resJson = res.responseJSON;
				if( resJson.code == 0 ){
					console.log( 0 );
					$( "#dialog" ).dialog( "open" );
					$( "body" ).animate( {"top":"0px"}, 5000, function(){
						$( "#dialog" ).dialog( "close" );
					} );
				}else{
					console.log( 1 );
				}
				$( '#addurl input:first' ).val( '' );
			}
		} );
	}

	/**
	 * Date扩展
	 *
	 * @param fmt
	 * @returns {*}
	 * @constructor
	 */
	Date.prototype.Format = function(fmt){ //author: meizz
		var o = {
			"M+":this.getMonth() + 1, //月份
			"d+":this.getDate(), //日
			"h+":this.getHours(), //小时
			"m+":this.getMinutes(), //分
			"s+":this.getSeconds(), //秒
			"q+":Math.floor( (this.getMonth() + 3) / 3 ), //季度
			"S":this.getMilliseconds() //毫秒
		};
		if( /(y+)/.test( fmt ) ) fmt = fmt.replace( RegExp.$1, (this.getFullYear() + "").substr( 4 - RegExp.$1.length ) );
		for( var k in o )
			if( new RegExp( "(" + k + ")" ).test( fmt ) ) fmt = fmt.replace( RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr( ("" + o[k]).length )) );
		return fmt;
	}

} );
