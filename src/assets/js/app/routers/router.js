var app = app || {};

(function () {
	app.AppRouter = Backbone.Router.extend({
		routes: {
			'': 'home',
			'about/': 'about'
		},
		home: function (){
			app.homeView = new app.HomeView();
		},
		about: function (){
			app.aboutView = new app.AboutView();
		}
	});
})();
