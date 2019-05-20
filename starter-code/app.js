require('dotenv').config();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy
const flash = require("connect-flash");

const User = require('./models/user.model')


// app.js
app.use(session({
  secret: "our-rol-app",
  resave: true,
  saveUninitialized: true
}))




passport.serializeUser((user, cb) => {
  cb(null, user._id)
})

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user)
  })
})


app.use(flash())

passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Usuario incorrecto" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.log(password)
      console.log(bcrypt.compareSync(password, user.password))

      return next(null, false, { message: "Contraseña incorrecta" });
    }
    console.log(user)
    return next(null, user);
  })
}))

app.use(passport.initialize())
app.use(passport.session())



mongoose
  .connect('mongodb://localhost/RolesBB', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);



// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Roles ex.';



const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth/autent.routes')
app.use('/auth', authRoutes)


module.exports = app;
