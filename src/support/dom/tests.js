var doc = context.document,
	docElement = doc.documentElement,
	body = doc.body,

	div = document.createElement('div'),
	style = div.style

	legacyEventModel = context.attachEvent && !context.addEventListener,
	supportsTextContent = div.textContent !== undefined,
	supportsOpacityProperty = style.opacity !== undefined,
	supportsGetComputedStyle = !!window.getComputedStyle,
	supportsCssTransition = 'transition' in style || 'MozTransition' in style || 'WebkitTransition' in style,
	supportQuerySelectorAll = !!document.querySelectorAll,
	supportMatchesSelector = !!(docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector);

// Clear memory
div = null;

PB.ready(function () {

	body = doc.body;
});
