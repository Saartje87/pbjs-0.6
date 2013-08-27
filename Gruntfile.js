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

				src: [

					'src/intro.js',

					// Core
					'src/core/utils.js',
					'src/core/class.js',

					// Patterns
					'src/patterns/observer.js',
					'src/patterns/queue.js',

					// $ DOM
					'src/dom/core.js',
					'src/dom/utils.js',
					'src/dom/attribute.js',
					'src/dom/style.js',
					'src/dom/manipulation.js',
					'src/dom/layout.js',
					'src/dom/traversal.js',
					'src/dom/event.js',
					'src/dom/buildfragment.js',
					'src/dom/enumerable.js',
					'src/dom/animation.js',

					'src/dom/queue.js',
					'src/dom/transition.js',
					'src/dom/morph.js',

					// Using native selector engine
					'src/dom/selector.js',

					// 
					'src/dom/ready.js',

					// Request
					'src/request/request.js',
					'src/request/utils.js',

					// Outro
					'src/outro.js'
				],
				dest: 'dist/pbjs.js'
			},
			legacy: {
				src: [

					'src/support/intro.js',

					// ES5 shims
					'src/support/core/es5.js',

					// $ DOM
					'src/support/dom/style.js',
					'src/support/dom/transition.js',
					'src/support/dom/event.js',
					'src/support/dom/qwery.js',

					// JSON

					// Outro
					'src/support/outro.js',

					// Qwery selector engine
					'vendor/qwery/qwery.js'
				],
				dest: 'dist/pbjs-legacy.js'
		    },
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

				src: ["dist/pbjs.js"],
				dest: "dist/pbjs.min.js"
			},
			legacy: {

				src: ["dist/pbjs-legacy.js"],
				dest: "dist/pbjs-legacy.min.js"
			}
		},
		watch: {
			scripts: {
				files: ['**/*.js'],
				tasks: ['default'],
				options: {
					//nospawn: true,
				},
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('test', ['jshint']);

};
