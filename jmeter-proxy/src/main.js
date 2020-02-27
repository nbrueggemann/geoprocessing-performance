var app = require('./application/app.js');
app.initialize();

// Include the routes
require('./routes/services')(app.getExpress());