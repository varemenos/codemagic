var app = app || {};

(function () {
	app.AppRouter = Backbone.Router.extend({
		routes: {
			'': 'new',
			'new/': 'new',
			'about/': 'about'
		},
		new: function (){
			app.newView = new app.NewView();
		},
		about: function (){
			app.aboutView = new app.AboutView();
		}
	});
})();
