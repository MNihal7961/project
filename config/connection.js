const mongoose = require('mongoose')
require('dotenv').config()


// To connect server to mongoDB
mongoose.connect(process.env.MONGOURL || "mongodb+srv://socieo:socieodbpass@social-media.ksb6luw.mongodb.net/?retryWrites=true&w=majority&appName=social-media", {
    useNewUrlParser: true,
    useUnifiedTopology: false
}).then(() => {
    console.log(" DB Connected");
}).catch((err) => {
    console.log(err)
})
