const mongoose = require("mongoose");
const Note = require("./models/Note.js");
const Article = require("./models/Article.js");
const request = require("request");
const cheerio = require("cheerio");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

mongoose.Promise = Promise;

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const routes = require("./controllers/scraper_controller.js");

app.use("/", routes);

mongoose.connect("mongodb://demeco:demeco@ds159856.mlab.com:59856/heroku_8m4ftb6k");
const db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

app.listen(PORT, function() {
    console.log("App running on PORT " + PORT);
});