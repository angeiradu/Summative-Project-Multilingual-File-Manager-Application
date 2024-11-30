const passport = require('passport');
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());  // If you want to use sessions