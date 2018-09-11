const request = require("request");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function(app) {

    app.get("/", function(req, res) {

        db.Article.find({ saved: false }).then(function(dbArticles){

            var theData = {dbArticles};
            res.render("index", theData);

        })
        .catch(function(err) {
            console.log(err);
        });

    });
    
    app.get("/saved", function(req, res) {

        db.Article.find({ saved: true })
        .populate("notes").then(function(dbArticles){
            var theData = {dbArticles};
            res.render("saved", theData);
        })
        .catch(function(err) {
            console.log(err);
        });

    });
    
    app.get("/api/scrape", function(req, res) {

        request("https://www.newyorker.com/news", function(error, response, html) {

            if (error) {
        
                console.log(error);
        
            } else {

                const $ = cheerio.load(html);
            
                $(".Card__content___10ZW7").each(function(i, element) {

                    const result = {};
                    const linkPiece= $(this).find("a");

                    result.title = $(this).find("a").find("h3").text();
                    result.link = $(linkPiece[1]).attr("href");
                    result.summary = $(this).find("p").text();
                    result.imageLink = $(this).find("img").attr("src");
                    let theData = [];

                    db.Article.create(result)
                    .then(function(dbArticles) {

                        res.send(dbArticles);
                    })
                    .catch(function(err) {
                        res.send();
                    });
                    
                });
            
            };

        });

    });

    app.get("/api/headlines", function(req, res) {

        if (req.query.saved === "false") {
            db.Article.find({ saved: false }).then(function(dbArticles) {
                res.send(dbArticles);
            }).catch(function(err) {
                console.log(err);
            })
        } else {
            db.Article.find({ saved:true })
            .populate("notes").then(function(dbArticles) {
                res.send(dbArticles);
            }).catch(function(err) {
                console.log(err);
            })
        };

    });

    app.get("/api/clear", function(req, res) {

        db.Article.deleteMany().then(function(dbArticles){
            res.send(true);
        });

        db.Note.deleteMany().then(function(){
            res.send(true);
        })

    });

    app.post("/api/headlines/:function/:id", function(req, res) {

        if (req.params.function === "save") {

            db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true})
            .then(function() {
                res.send("");
            });

        } else if (req.params.function === "unsave") {

            db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false})
            .then(function() {
                res.send("");
            });

        };

    });

    app.post("/api/notes/:id", function(req, res) {

        db.Note.create(req.body)
            .then(function(dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id} }, { upsert: true });
            })
            .then(function(dbArticles) {
                res.json(dbArticles);
            })
            .catch(function(err) {
                res.json(err);
            });
      
    });

    app.delete("/api/notes/:id", function(req, res) {

        db.Note.deleteOne({ _id: req.params.id}).then(function() {
            res.send("");
        })

    })

};