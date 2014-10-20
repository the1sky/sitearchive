$( document ).ready( function(){
	$( '#menu_comp' ).css( 'background-color', '#f9f9f9' );

	var selectedUrl = '';
	var compUrl = '';
	var today = $.getDateStr( 0 );
	var startDate = $.getDateStr( -30 );
	var endDate = today;
	var unit = '';

	var chart_list = {};

	var echartsOption = function(title, legendData, xAxisData, selectedUrlDataWithCache, selectedUrlDataWithNoCache, compUrlDataWithNoCache, compUrlDataWithCache,unit){
		return {
			title:{
				text:title
			},
			tooltip:{
				trigger:'axis'
			},
			legend:{
				data:legendData
			},
			calculable:true,
			xAxis:[
				{
					type:'category',
					data:xAxisData
				}
			],
			yAxis:[ // 直角坐标系中纵轴数组
				{
					type:'value', // 坐标轴类型，纵轴默认为数值轴，类目轴则参考xAxis说明
					name:'',
					splitNumber:4,// 数值轴用，分割段数，默认为5
					axisLabel:{
						formatter:'{value}' + unit
					}
				}
			],
			series:[
				{
					name:legendData[0],
					type:'line',
					data:selectedUrlDataWithNoCache,
					markLine:{
						data:[
							{type:'average', name:'平均值'}
						]
					}
				},
				{
					name:legendData[1],
					type:'line',
					data:selectedUrlDataWithCache,
					markLine:{
						data:[
							{type:'average', name:'平均值'}
						]
					}
				},
				{
					name:legendData[2],
					type:'line',
					data:compUrlDataWithNoCache,
					markLine:{
						data:[
							{type:'average', name:'平均值'}
						]
					}
				},
				{
					name:legendData[3],
					type:'line',
					data:compUrlDataWithCache,
					markLine:{
						data:[
							{type:'average', name:'平均值'}
						]
					}
				}
			]
		};
	};

	var createChartContainer = function(id){
		var div = $( '<div></div>' );
		div.attr( 'id', id );
		div.addClass( 'trendChart' );
		$( '#trend' ).prepend( div );
		return {id:id, div:div}
	};

	var renderChart = function(jqObj){
		var metric = jqObj.val();
		var desc = jqObj.attr( 'desc' );
		var selectUrlYAxisDataWithNoCache = getYAxisData( selectedUrl, compUrl, metric, $.xAxisData, selectedUrl, true );
		var selectUrlYAxisDataWithCache = getYAxisData( selectedUrl, compUrl, metric, $.xAxisData, selectedUrl, false );
		var compUrlYAxisDataWithNoCache = getYAxisData( selectedUrl, compUrl, metric, $.xAxisData, compUrl, true );
		var compUrlYAxisDataWithCache = getYAxisData( selectedUrl, compUrl, metric, $.xAxisData, compUrl, false );
		var id = metric + '_chart';
		chart_list[id] = createChartContainer( id );
		var div = chart_list[id]['div'];
		$( '#trend' ).prepend( div );
		var chart = echarts.init( document.getElementById( id ), e_macarons );
		chart_list[id].chart = chart;

		var legendData = [selectedUrl + '_无缓存', selectedUrl + '_带缓存', compUrl + '_无缓存', compUrl + '_带缓存'];

		if( selectUrlYAxisDataWithNoCache && compUrlYAxisDataWithNoCache ){
			chart.setOption( echartsOption( desc, legendData, $.xAxisData,
				selectUrlYAxisDataWithNoCache, selectUrlYAxisDataWithCache,
				compUrlYAxisDataWithNoCache, compUrlYAxisDataWithCache, unit ) );
		}

		//滚动到
		$.scrollTo( 'metricslist' );
	}

	var removeChart = function(id){
		var chartInfo = chart_list[id];
		if( chartInfo ){
			if( chartInfo.chart ){
				chartInfo.chart.clear();
				chartInfo.chart.dispose();
			}
			id = '#' + id;
			$( id ).remove();
		}
	}

	var removeAllCharts = function(){
		for( var id in chart_list ){
			removeChart( id );
		}
	}

	/**
	 * 设置checkbox
	 */
	$( '.metriclist' ).iCheck( {
		checkboxClass:'icheckbox_flat-green',
		radioClass:'iradio_flat-green',
		increaseArea:'20%' // optional
	} );
	$( '.metriclist' ).on( 'ifChecked', function(e){
		if( $.perfData ){
			renderChart( $( this ) );
		}
	} ).on( 'ifUnchecked', function(e){
		var metric = $( this ).val();
		var id = metric + '_chart';
		removeChart( id );
	} );

	/**
	 * 时间选择
	 *
	 */
	var dateRange = new pickerDateRange( 'date_picker', {
		isTodayValid:true,
		startDate:startDate,
		endDate:endDate,
		autoSubmit:true,
		theme:'ta',
		defaultText:' 至 ',
		success:function(obj){
			startDate = obj['startDate'];
			endDate = obj['endDate'];
			$.perfData = null;
			$.getCompData( selectedUrl, compUrl, startDate, endDate, function(json){
				preRender( json );
			} )
		}
	} );

	var getXAxisData = function(){
		var len = $.perfData.length;
		var timeArr = [];
		var dayObj = {};
		for( var i = 0; i < len; i++ ){
			var item = $.perfData[i];
			var day = item.day;
			if( !dayObj[day] ){
				timeArr.push( day );
				dayObj[day] = 1;
			}
		}
		return timeArr;
	}

	var getYAxisData = function(selectedUrl, compUrl, metric, daysArr, targetUrl, withNoCache){
		var existDay = {};
		var len = daysArr.length;
		for( var i = 0; i < len; i++ ){
			existDay[daysArr[i]] = true;
		}

		len = $.perfData.length;
		var urlData = [];
		for( i = 0; i < len; i++ ){
			var item = $.perfData[i];
			var url = item.url;
			var day = item.day;
			var runstep = item['runstep'];
			var targetRunstep = withNoCache ? 1 : 2;
			if( runstep == targetRunstep && url == targetUrl ){
				var metricValue = existDay[day] ? item[metric] : 0;
				if( /_requests|_count/.test( metric ) ){
					unit = '个';
				}else if( /_size/.test( metric ) ){
					metricValue = metricValue / 1024;
					unit = 'Kb';
				}else{
					unit = 'ms';
				}
				metricValue = Math.round( metricValue );
				urlData.push( metricValue );
			}
		}
		return urlData;
	}

	/**
	 * 渲染前数据处理
	 * @param json
	 */
	var preRender = function(json){
		if( json && json.code == 0 && json.data && json.data.length > 0 ){
			removeAllCharts();

			$.perfData = json.data;
			$.xAxisData = getXAxisData()
			var checked = $( '.metriclist:checkbox:checked' );
			var len = checked.length;
			for( var i = 0; i < len; i++ ){
				var jqObj = $( checked[i] );
				renderChart( jqObj );
			}
		}else{
			console.log( 'json data null!' );
		}
	}

	/**
	 * url列表
	 * @type {*|jQuery|HTMLElement}
	 */
	var selector = $( '#urls' );
	selector.minimalect( {
		'afterinit':function(){
			var url = $.getUrlParam( 'url' );
			if( !url ){
				selectedUrl = $( '#urls option' )[0].value.toString();
			}
			selector.val( selectedUrl ).change();
		},
		'onchange':function(val, txt){
			selectedUrl = val;
			$.perfData = null;
			$.getCompData( selectedUrl, compUrl, startDate, endDate, function(json){
				preRender( json );
			} );
		}
	} );

	/**
	 * 对比产品url列表
	 * @type {*|jQuery|HTMLElement}
	 */
	var selectorUrlComp = $( '#urls_comp' );
	selectorUrlComp.minimalect( {
		'afterinit':function(){
			var url = $.getUrlParam( 'url' );
			if( !url ){
				compUrl = $( '#urls_comp option' )[0].value.toString();
			}
			selectorUrlComp.val( compUrl ).change();
		},
		'onchange':function(val, txt){
			compUrl = val;
			$.perfData = null;
			$.getCompData( selectedUrl, compUrl, startDate, endDate, function(json){
				preRender( json );
			} );
		}
	} );


} );

