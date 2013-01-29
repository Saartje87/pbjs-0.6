# PB.Date

## Constructor
~~~
new PB.Date();

new PB.Date( milliseconds );

new PB.Date( year, month, day, hours, minutes, seconds, milliseconds );

new PB.Date( '2012-12-01T10:39:11+0200' );
~~~

### format
Format date using PHP date syntax
~~~
var date = new PB.Date();

data.format('Y-m-d H:i:s');

// ISO8601 date
// Ouput silelar to 2012-12-01T10:39:11+0200
data.format('c');
~~~