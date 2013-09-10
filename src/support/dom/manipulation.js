if( !supportsTextContent ) {

	/**
	 *
	 */
	PB.$.fn.setText = function ( value ) {

		var i = 0;

		// Empty elements
		this.setHtml('');

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].appendChild(doc.createTextNode(value));
		}

		return this;
	};

	/**
	 *
	 */
	PB.$.fn.getText = function () {

		return this[0].innerText;
	};
}
