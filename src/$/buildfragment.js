PB.$.buildFragment = function ( html ) {
	
	var fragment = doc.createElement('div'),
		children;

	fragment.innerHTML = html;

	children = PB.$(fragment).children();

	fragment = null;

	return children;
}
