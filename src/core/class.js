/**
 * Create a wrapper function that makes it possible to call the parent method
 * trough 'this.parent()'
 */
function createClassResponder ( method, parentMethod ) {

    return function () {

        this.parent = parentMethod;

        return method.apply( this, arguments );
    };
}

PB.Class = function ( parentClass, baseProto ) {

    var child, childProto, constructor,
        name, prop, parentProp, parentProto, parentConstructor;

    if( !baseProto ) {

        baseProto = parentClass;
        parentClass = null;
    }

    if( baseProto.construct || baseProto.constructor.toString().indexOf('Function()') > -1 ) {

        constructor = baseProto.construct || baseProto.constructor;
    }

    if( parentClass ) {

        parentProto = parentClass.prototype;

        if( constructor ) {

            parentConstructor = parentClass;
        } else {

            constructor = parentClass;
        }
    }

    child = constructor
        ? function () { if( parentConstructor ) { this.parent = parentConstructor; }  return constructor.apply(this, arguments); }
        : function () {};
    
    childProto = child.prototype;

    // Fill our prototype
    for( name in baseProto ) {
        
        if( baseProto.hasOwnProperty(name) && name !== 'construct' ) {

            prop = baseProto[name];
            parentProp = parentClass ? parentProto[name] : null;

            if( parentProp && typeof prop === 'function' && typeof parentProp === 'function' ) {

                prop = createClassResponder(prop, parentProp);
            }

            childProto[name] = prop;
        }
    }

    PB.extend(childProto, parentProto);

    return child;
};