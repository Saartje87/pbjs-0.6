function getMatrix ( element ) {

	var matrix = window.getComputedStyle(element, null)[prefixStyles['transform']];

	//PB.log(matrix);

	matrix = matrix.replace(/\s/g, '').substr(7);

	return matrix.substr(0, matrix.length - 1).split(',').map(parseFloat);
}

var Transform = {

	setX: function ( element, value ) {

		if( prefixStyles['transform'] ) {

			element.style[prefixStyles['transform']] = 'translateX('+value+')';
		} else {

			// Set relative if normal element..
			if( element.style.position === 'static' ) {

				element.style.position = 'relative';
			}

			element.style.left = value;
		}
	},

	getX: function ( element, value ) {

		var matrix = getMatrix(element);

		// matrix(1, 0, 0, 1, 0, 0)
		// matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
		return matrix[matrix.length === 6 ? 4 : 12];
	},

	//
	setY: function ( element, value ) {

		element.style[prefixStyles['transform']] = 'translateY('+value+')';
	},

	getY: function ( element, value ) {

		var matrix = getMatrix(element);

		return matrix[matrix.length === 6 ? 5 : 13];
	},

	setZ: function ( element, value ) {

		element.style[prefixStyles['transform']] = 'translateZ('+value+')';
	},

	getZ: function ( element, value ) {

		var matrix = getMatrix(element);

		return matrix[matrix.length - 2];
	},
};

// Hooks
PB.$.hook('setStyle.x', Transform.setX);
PB.$.hook('getStyle.x', Transform.getX);

PB.$.hook('setStyle.y', Transform.setY);
PB.$.hook('getStyle.y', Transform.getY);

PB.$.hook('setStyle.z', Transform.setZ);
PB.$.hook('getStyle.z', Transform.getZ);
