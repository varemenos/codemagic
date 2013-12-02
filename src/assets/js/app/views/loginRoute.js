$(function () {
	'use strict';

	app.mvc.views.LoginView = Backbone.View.extend({
		el: '#container',
		events : {
			'submit form': 'formSubmittion'
		},
		formSubmittion: function () {
			var state = app.utils.getState();
			localStorage.setItem('codemagic.auth.state', state);

			$('form [name=state]').val(state);

			return true;
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.template = _.template($('#login-template').html());

			this.$el.append(this.template());
			return this;
		}
	});
});
