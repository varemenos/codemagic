module.exports = function (grunt) {
	// load tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		vars: {
			version: '<%= grunt.template.today("yyyy.mm.dd-HH.MM") %>'
		},
		dirs: {
			src: 'src',
			css: 'assets/css',
			js: 'assets/js',
			build: 'build'
		},
		copy: {
			build: {
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>/',
					src: ['**'],
					dest: '<%= dirs.build %>/'
				}]
			}
		},
		concat: {
			options: {
				seperator: ';',
			},
			build: {
				src: [
					'<%= dirs.build %>/<%= dirs.js %>/libs/jquery.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/underscore.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/backbone.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/emmet.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/selectize.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/beautify.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/beautify-html.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/beautify-css.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/marked.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/less.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/utils.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/routers/*.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/views/*.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/collections/*.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/models/*.js',
					'<%= dirs.build %>/<%= dirs.js %>/ace/ace.js',
					'<%= dirs.build %>/<%= dirs.js %>/ace/ext-emmet.js',
					'<%= dirs.build %>/<%= dirs.js %>/ace/ext-language_tools.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/main.js'
				],
				dest: '<%= dirs.build %>/<%= dirs.js %>/script.js'
			}
		},
		sass: {
			options: {
					unixNewlines: true
			},
			dev: {
				options: {
					style: 'expanded'
				},
				files: [{
					'<%= dirs.build %>/<%= dirs.css %>/style.css': '<%= dirs.build %>/<%= dirs.css %>/style.scss'
				}]
			},
			dist: {
				options: {
					style: 'compressed'
				},
				files: [{
					'<%= dirs.build %>/<%= dirs.css %>/style.css': '<%= dirs.build %>/<%= dirs.css %>/style.scss'
				}]
			}
		},
		clean: {
			build: ['<%= dirs.build %>/'],
			buildCleanup: [
				'<%= dirs.build %>/<%= dirs.css %>/lib',
				'<%= dirs.build %>/<%= dirs.css %>/*.scss',
				'<%= dirs.build %>/<%= dirs.js %>/app',
				'<%= dirs.build %>/<%= dirs.js %>/libs'
			]
		},
		uglify: {
			options: {},
			build: {
				files: {
					'<%= dirs.build %>/<%= dirs.js %>/script.js': ['<%= dirs.build %>/<%= dirs.js %>/script.js']
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			files: {
				files: ['<%= dirs.src %>/**/**.*'],
				tasks : ['dev']
			}
		},
		htmlmin: {
			build: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true
				},
				files: {
					'<%= dirs.build %>/index.html': '<%= dirs.build %>/index.html',
					'<%= dirs.build %>/404.html': '<%= dirs.build %>/404.html'
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 80,
					base: './build',
					hostname: '*',
					keepalive: true,
					livereload: true,
					open: 'http://localhost'
				}
			}
		}
	});

	// default task
	grunt.registerTask('dev',['clean:build', 'copy:build', 'concat:build', 'sass:dev', 'htmlmin:build', 'clean:buildCleanup']);
	grunt.registerTask('dist', ['clean:build', 'copy:build', 'concat:build', 'sass:dist', 'uglify:build', 'htmlmin:build', 'clean:buildCleanup']);
	grunt.registerTask('default', ['watch:files']);
};
