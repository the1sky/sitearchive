$( document ).ready( function(){
	$( '#menu_trend' ).css( 'background-color', '#f9f9f9' );

	var today = $.getDateStr( 0 );
	var startDate = $.getDateStr( -30 );
	var endDate = today;
	var chart_list = {};
	var legendData = ['无缓存', '带缓存'];
	var unit = '';

	/**
	 * echart配置
	 *
	 * @param title
	 * @param legendData
	 * @param xAxisData
	 * @param selectedUrlData
	 * @returns {{title: {text: *}, tooltip: {trigger: string}, legend: {data: *}, calculable: boolean, xAxis: {type: string, data: *}[], yAxis: {type: string, name: string, splitNumber: number}[], series: {name: *, type: string, data: *}[]}}
	 */
	var echartsOption = function(title, legendData, xAxisData, selectedUrlDataWithNoCache, selectedUrlDataWithCache, unit){
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
				}
			]
		};
	};

	/**
	 * echarts图表容器
	 *
	 * @param id
	 * @returns {{id: *, div: (*|jQuery|HTMLElement)}}
	 */
	var createChartContainer = function(id){
		var div = $( '<div></div>' );
		div.attr( 'id', id );
		div.addClass( 'trendChart' );
		$( '#trend' ).prepend( div );
		return {
			id:id,
			div:div
		}
	};

	/**
	 * 渲染echarts图表
	 *
	 * @param jqObj
	 */
	var renderChart = function(jqObj){
		var metric = jqObj.val();
		var desc = jqObj.attr( 'desc' );
		var yAxisDataWithNoCache = getYAxisData( metric, $.xAxisData, true );
		var yAxisDataWithCache = getYAxisData( metric, $.xAxisData, false );
		var id = metric + '_chart';
		chart_list[id] = createChartContainer( id );
		var div = chart_list[id]['div'];
		$( '#trend' ).prepend( div );
		var chart = echarts.init( document.getElementById( id ), e_macarons );
		chart_list[id].chart = chart;

		if( yAxisDataWithNoCache && yAxisDataWithCache ){
			chart.setOption( echartsOption( desc, legendData, $.xAxisData, yAxisDataWithNoCache, yAxisDataWithCache, unit ) );
		}

		//滚动到
		$.scrollTo( 'metricslist' );
	}

	/**
	 * 删除指定图表
	 *
	 * @param id
	 */
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

	/**
	 * 删除所有图表
	 */
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
	} )


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
			$.getTrendData( startDate, endDate, function(json){
				preRender( json );
			} )
		}
	} );

	/**
	 * 横坐标数据
	 *
	 * @returns {Array}
	 */
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

	/**
	 * 纵坐标数据
	 *
	 * @param selectedUrl
	 * @param metric
	 * @param daysArr
	 * @returns {Array}
	 */
	var getYAxisData = function(metric, daysArr, withNoCache){
		var existDay = {};
		var len = daysArr.length;
		for( var i = 0; i < len; i++ ){
			existDay[daysArr[i]] = true;
		}
		len = $.perfData.length;
		var urlData = [];
		for( i = 0; i < len; i++ ){
			var item = $.perfData[i];
			var runstep = item['runstep'];
			var day = item['day'];
			var targetRunstep = withNoCache ? 1 : 2;
			if( runstep == targetRunstep ){
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
	 * render前数据处理
	 * @param json
	 */
	var preRender = function(json){
		if( json && json.code == 0 && json.data && json.data.length > 0 ){
			removeAllCharts();

			$.perfData = json.data;
			$.xAxisData = getXAxisData();
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
	 * 默认加载数据
	 */
	$.getTrendData( startDate, endDate, function(json){
		preRender( json );
	} )
} );