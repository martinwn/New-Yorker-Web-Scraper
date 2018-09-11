$(document).ready(function() {

    const articleContainer = $(".article-container");
    $(document).on("click", ".save", saveHandler);
    $(document).on("click", ".scrape", scrapeHandler);
    $(document).on("click", ".clear", clearHandler); 
    $(document).on("click", ".remove-save", unsaveHandler);
    $(document).on("click", ".attach-note", showNoteForm); 
    $(document).on("click", ".note-submit", noteHandler);  
    $(document).on("click", ".show-notes", showNotes);
    $(document).on("click", ".delete-note", deleteNotes);
    $(document).on("click", ".close-no-results", closeNoResults)

    function initPage () {

        if (window.location.href === "http://localhost:5000/") {

            $.get("/api/headlines?saved=false").then(function(data) {

                articleContainer.empty();
    
                if (data && data.length) {
                    renderUnsavedArticles(data);
                } else {
                    renderEmpty();
                };
            });

        } else {

            $.get("/api/headlines?saved=true").then(function(data) {

                articleContainer.empty();
    
                if (data && data.length) {
                    renderSavedArticles(data);
                } else {
                    renderEmptySaved();
                };
            });

        };

    };

    function renderEmpty () {

        const emptyAlert = $("<div class='alert'><h2>No articles found.</h2><div><h3>What Would You Like To Do?</h3></div><div><a class='scrape'><h4>Try Scraping New Articles</h4></a><a href='/saved'><h4>Go to Saved Articles</h4></a></div></div>")
            
        articleContainer.append(emptyAlert);

    };

    function renderEmptySaved () {

        const emptyAlert = $("<div class='alert'><h2>No articles found.</h2><div><h3>What Would You Like To Do?</h3></div><div><a href='/'><h4>Go Home</h4></a></div></div>")
            
        articleContainer.append(emptyAlert);

        $(".modal-loading").hide();
        $(".page-overlay").hide();

    };

    function renderUnsavedArticles (articles) {

        const articleCards = [];

        for (let i in articles) {
            articleCards.push(createUnsavedCard(articles[i]));
        };

        const articlesHeader = $("<h1 class='article-header'>Articles</h1>")

        articleContainer.append(articlesHeader, articleCards)

        $(".modal-loading").hide();
        $(".page-overlay").hide();

    };

    function createUnsavedCard (article) {

        const newCard = $(`<div class='article'><div style="background-image: url(${article.imageLink}); background-size: cover; background-position: center;"></div><div><a href="https://www.newyorker.com${article.link}"><h1>${article.title}</h1></a><p>${article.summary}</p></div><div><button class='save' data-id='${article._id}'>Save Article</button></div></div>`)

        return newCard;

    };

    function renderSavedArticles (articles) {

        const articleCards = [];

        for (let i in articles) {
            articleCards.push(createSavedCard(articles[i]));
        };
        
        const articlesHeader = $("<h1 class='article-header'>Articles</h1>")

        articleContainer.append(articlesHeader, articleCards);

    };

    function createSavedCard (article) {
        
        let notes = article.notes;

        let newCard = $("<div class='article'>");
        newCard.append(`<div style="background-image: url(${article.imageLink}); background-size: cover; background-position: center;"></div><div><a href="https://www.newyorker.com${article.link}"><h1>${article.title}</h1></a><p>${article.summary}</p></div><div><button class="attach-note" data-id="${article._id}">Attach Note</button><button class="remove-save" data-id="${article._id}">Remove From Saved</button><button class="show-notes" data-id="${article._id}">Show Notes</button></div><div class="modal" style="display: none"><form action=""><input class="name" type="text" placeholder="Name" required autofocus><textarea class="message" cols="30" rows="5" placeholder="Leave a note" required></textarea><button data-id="${article._id}" class="note-submit">Submit</button></form></div>`);
        let noteModal = $("<div class='modal-notes' style='display: none'><h2>Notes</h2></div>");
        if (notes && notes.length) {

            let newDiv = $("<div>")
            for (i = 0; i < notes.length; i++) {
                let newDiv2 = $("<div>");
                let newNote = $(`<span>${notes[i].name}: </span><span> "${notes[i].message}" </span>`);
                let deleteButton = $(`<button class='delete-note' data-id='${notes[i]._id}'></button>`).text("Delete");
                newDiv2.append(newNote, deleteButton);
                newDiv.append(newDiv2);
            };
            noteModal.append(newDiv);
            newCard.append(noteModal);
        } else {
            noteModal.append("<div><h5>There are no saved notes.</h5></div>");
            newCard.append(noteModal);
        }

        return newCard;

    };

    function saveHandler () {

        let articleId = $(this).attr("data-id");

        $.ajax({
            method: "POST",
            url: `/api/headlines/save/${articleId}`
        }).then(function() {
            initPage();
        })

    };

    function unsaveHandler () {

        let articleId = $(this).attr("data-id");

        $.ajax({
            method: "POST",
            url: `/api/headlines/unsave/${articleId}`
        }).then(function() {
            initPage();
        })

    };

    function scrapeHandler () {

        $(".modal-loading").show();
        $(".page-overlay").show();

        $.get("/api/scrape").then(function(data) {
            if (!data) {

                $(".modal-loading").hide()

                $(".modal-no-results").show()
                $(".page-overlay").show();

            } else {
                initPage();
            }
        });

    };

    function clearHandler () {

        $.get("/api/clear").then(function() {
            articleContainer.empty();
            initPage();
        });

    };

    function showNoteForm () {

        const modal = $(this).parent().siblings(".modal");

        modal.toggle();

    };

    function noteHandler () {

        console.log("this works");

        event.preventDefault();

        let articleId = $(this).attr("data-id");

        $.ajax({
            method: "POST",
            url: `/api/notes/${articleId}`,
            data: {
                name: $(this).siblings(".name").val(),
                message: $(this).siblings(".message").val()
            }
        }).then(function(data) {
            initPage();
        });

    };

    function showNotes () {

        let modal = $(this).parent().siblings(".modal-notes");

        modal.toggle();

    };

    function deleteNotes () {

        let articleId = $(this).attr("data-id");
        console.log(this);
        $.ajax({
            method: "DELETE",
            url: `api/notes/${articleId}`
        }).then(function() {
            initPage();
        });

    };

    function closeNoResults () {
        $(".modal-no-results").hide()
        $(".page-overlay").hide();
    }

});