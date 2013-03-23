define(function() {
	return {
		search : {
			string : window.location.search,
			params : window.location.search.substring(1).split("&")
		},
		hash : {
			string: location.hash.substring(1),
			params : {}
		},
		regex : /([^&=]+)=([^&]*)/g,
		m : false
	};
});
