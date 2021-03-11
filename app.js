
/**
 * Module dependencies.
 */

var express      = require('express'),
    http         = require('http'),
    app          = express(),
    path         = require( 'path' ),
    mongoose     = require( 'mongoose' );

mongoose.connect(
    'mongodb://localhost:27017/cross_game', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });

// all environments
app.set('port', process.env.PORT || 7070);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( '/public', express.static( __dirname + '/public' ));

/** routes **/
// frontend
require('./routes/main')( app );
/** end routes **/

http.createServer(app).listen(app.get('port'), function(){
    console.log('Lets game :) ' + app.get('port'));
});


