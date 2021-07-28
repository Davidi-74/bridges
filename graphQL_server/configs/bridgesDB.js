const mongoose = require('mongoose');
// require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/bridgesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})