module.exports = function(grunt) {

	var banner = 
				'/*!\n' +
				' * pbjs JavaScript Framework v<%= pkg.version %>\n' +
				' * http://saartje87.github.com/pbjs\n' +
				' *\n' +
				' * Includes Qwery\n' +
				' * https://github.com/ded/qwery\n' +
				' *\n' +
				' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
		        ' * Licensed <%= pkg.license %>\n' +
				' *\n' +
				' * Build date <%= grunt.template.today("yyyy-mm-dd HH:MM") %>\n' +
				' */\n';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// Concat
		concat: {
			options: {

				banner: banner
			},
			dist: {

				src: ['<banner>', 

					// Todo: Put every section in own closure?

					'src/intro.js',

					// Core
					'src/core/utils.js', 'src/core/class.js',

					// Patterns
					'src/patterns/observer.js',
					'src/patterns/queue.js',

					// $ DOM
					'src/dom/core.js',
					'src/dom/utils.js',
					'src/dom/attribute.js',
					'src/dom/style.js',
					'src/dom/morph.js',
					'src/dom/manipulation.js',
					'src/dom/layout.js',
					'src/dom/traversal.js',
					'src/dom/event.js',
					'src/dom/buildfragment.js',
					'src/dom/enumerable.js',
					'src/dom/animation.js',

					// Using native selector engine
					'src/dom/selector.js',

					// 
					'src/dom/ready.js',

					// Older browser support files
					'src/dom/support/legacy.js',
					'src/dom/support/event.js',

					// Request
					'src/request/request.js',
					'src/request/utils.js',

					// JSON

					// String

					// Outro
					'src/outro.js'
				],
				dest: 'dist/pbjs.js'
			}
		},
		jshint: {

			options: {
                jshintrc: '.jshintrc'
            },
            afterconcat: ['dist/pbjs.js']
		},
		// Uglify
		uglify: {

			options: {

				report: 'gzip',
				preserveComments: 'some'
			},
			build: {

				src: ["dist/pbjs.js", /*"vendor/qwery/qwery.js"*/],
				dest: "dist/pbjs.min.js"
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('test', ['jshint']);

};
