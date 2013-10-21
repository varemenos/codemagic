var app = app || {};

(function () {
	$(function () {
		'use strict';

		app.title = "Hello Warl";

		// populate editors with example content

		app.router = new app.AppRouter();
		Backbone.history.start();
		app.editors.htmlSession.setValue('<h1>Hello World</h1>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur, nobis, inventore, cupiditate, itaque quae quas commodi reprehenderit expedita aliquid nulla vero voluptatem esse modi quasi similique atque sequi tempore dolore ut nesciunt aliquam quidem dolorum ipsa totam eaque accusamus odit maiores fugiat incidunt iste. Itaque necessitatibus cupiditate consequatur vitae maxime.</p>');
		app.editors.cssSession.setValue('body{ margin: 0; padding: 1rem; }\n\nh1{\n	margin-top: 0;\n	color: #666;\n}\n\np{\n	color: #999;\n}');
		app.editors.jsSession.setValue('var x = document.querySelector("p");\nx.style.textAlign = "justify";');
	});
})();
