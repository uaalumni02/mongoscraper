const request = require("request");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
mongoose.Promise = Promise;
const express = require("express");
const router = express.Router();

const Note = require("../models/Note.js");
const Article = require("../models/Article.js");

router.get("/", function(req, res) {
    res.render("index");
});

router.get("/savedarticles", function(req, res) {

    Article.find({}, function(error, doc) {

        if (error) {
            console.log(error);
        } else {
            const hbsArticleObject = {
                articles: doc
            };

            res.render("savedarticles", hbsArticleObject);
        }
    });
});

router.post("/scrape", function(req, res) {

    request("http://www.nytimes.com/", function(error, response, html) {

        const $ = cheerio.load(html);


        const scrapedArticles = {};

        $("article h2").each(function(i, element) {


            const result = {};


            result.title = $(this).children("a").text();

            console.log("title? " + result.title);

            result.link = $(this).children("a").attr("href");

            scrapedArticles[i] = result;

        });

        console.log("Scraped Articles: " + scrapedArticles);

        const hbsArticleObject = {
            articles: scrapedArticles
        };

        res.render("index", hbsArticleObject);

    });
});

router.post("/save", function(req, res) {

    console.log("Title: " + req.body.title);

    const newArticleObject = {};

    newArticleObject.title = req.body.title;

    newArticleObject.link = req.body.link;

    const entry = new Article(newArticleObject);

    console.log("Save article: " + entry);


    entry.save(function(err, doc) {

        if (err) {
            console.log(err);
        } else {
            console.log(doc);
        }
    });

    res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

    Article.findOneAndRemove({ "_id": req.params.id }, function(err, offer) {
        if (err) {
            console.log("Cannot delete:" + err);
        } else {
            console.log("Can delete");
        }
        res.redirect("/savedarticles");
    });
});

router.get("/notes/:id", function(req, res) {

    Note.findOneAndRemove({ "_id": req.params.id }, function(err, doc) {
        if (err) {
            console.log("Cannot delete:" + err);
        } else {
            console.log("Can delete");
        }
        res.send(doc);
    });
});


router.get("/articles/:id", function(req, res) {


    Article.findOne({ "_id": req.params.id })

        .populate('notes')

        .exec(function(err, doc) {
            if (err) {
                console.log("Cannot find notes.");
            } else {
                console.log("We are getting article and possible notes? " + doc);
                res.json(doc);
            }
        });
});

router.post("/articles/:id", function(req, res) {

    const newNote = new Note(req.body);

    newNote.save(function(error, doc) {

        if (error) {
            console.log(error);
        } else {

            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { notes: doc._id } }, { new: true, upsert: true })

                .populate('notes')

                .exec(function(err, doc) {
                    if (err) {
                        console.log("Cannot find article.");
                    } else {
                        console.log("we are getting notes " + doc.notes);
                        res.send(doc);
                    }
                });
        }
    });
});

module.exports = router;