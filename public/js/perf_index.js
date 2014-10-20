$( document ).ready( function(){
	var renderUrlList = function(json){
		$( '#url_list' ).empty();

		var renderData = {
			'items':[]
		};

		var len = json.length;
		for( var i = 0; i < len; i++ ){
			var item = {
				'badges':[],
				'content':''
			};
			var urlInfo = json[i];
			var url = urlInfo.url;
			var time = urlInfo.createdAt;

			item.badges.push( {badge:time} );
			item.content = url;
			renderData.items.push( item );
		}

		var template = $( '#url_list_t' ).html();
		Mustache.parse( template );   // optional, speeds up future uses
		var rendered = Mustache.render( template, renderData );
		$( '#url_list' ).html( rendered );
	}

	$.ajax( {
		'url':'/urls/get',
		'type':'post',
		'complete':function(res){
			var resJson = res.responseJSON;
			if( resJson.code == 0 ){
				$.perfData = resJson.data;
				renderUrlList( resJson.data );
			}else{
			}
		}
	} );

	$( '#task_detail a' ).click( function(e){
		e.preventDefault();
		$( this ).tab( 'show' );
	} );

	$( 'a[data-toggle="tab"]' ).on( 'show.bs.tab', function(e){
		var href = e.target.href;
	} );

	$("#owl").owlCarousel({
		navigation : false, // Show next and prev buttons
		slideSpeed : 300,
		paginationSpeed : 400,
		singleItem:true,
		autoPlay:true

		//see at:http://owlgraphic.com/owlcarousel/#how-to
	});
} );


