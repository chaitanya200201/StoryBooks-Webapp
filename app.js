const express = require('express')
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const connectDB = require('./config/db')
const path = require('path');
const passport = require('passport')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)


//Load config
dotenv.config({path : './config/config.env'})

require('./config/passport')(passport)

connectDB()

//passport config

const app = express();
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

//body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//methon override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

//handlebars helpers
const  { formatDate, stripTags, truncate, editIcon, select }  = require('./helpers/hbs')

//handlebars
app.engine('.hbs', exphbs({
    helpers : { formatDate, stripTags, truncate, editIcon, select},
    defaultLayout : 'main',
    extname: '.hbs'}));
app.set('view engine', '.hbs');

//session
app.use(session({
    secret :'keyboard cat',
    resave : false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

// //set global middleware
app.use(function(req, res, next) {
    res.locals.user = req.user || null
    next()
})


//static folder
app.use(express.static(path.join(__dirname, 'public')));

//passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'});

// routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;


app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));