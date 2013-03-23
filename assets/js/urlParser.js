define(['jquery'], function($) {
	var urlParser = {
		search : {
			string : window.location.search,
			params : window.location.search.substring(1).split('&')
		},
		hash : {
			string: location.hash.substring(1),
			params : {}
		},
		regex : /([^&=]+)=([^&]*)/g,
		m : false
	};

	while (!! (urlParser.m = urlParser.regex.exec(urlParser.hash.string))) {
		urlParser.hash.params[decodeURIComponent(urlParser.m[1])] = decodeURIComponent(urlParser.m[2]);
	}

	while (!! (urlParser.m = urlParser.regex.exec(urlParser.search.string))) {
		urlParser.search.params[decodeURIComponent(urlParser.m[1])] = decodeURIComponent(urlParser.m[2]);
	}

	if(urlParser.hash.params.state === '?auth'){
		localStorage.setItem('access_token', urlParser.hash.params.access_token);

		$.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + localStorage.getItem('access_token'), function(data) {
			if(parseInt(data.expires_in, 10) > 0 && data.audience === appSession.authenticate.client_id){
				localStorage.setItem('expires_in', data.expires_in);
				localStorage.setItem('access_type', data.access_type);
				localStorage.setItem('user_id', data.user_id);

				window.location.replace('./');
			}else{
				// TODO handle session hijacking or expiration errors
			}
		});
	}

	return urlParser;
});
