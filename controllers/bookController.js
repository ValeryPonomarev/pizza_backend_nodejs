var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {
    async.parallel({
        book_count: (callback) => {
            Book.countDocuments({}, callback);
        },
        book_instance_count: (callback) => {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: (callback) => {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: (callback) => {
            Author.countDocuments({}, callback);
        },
        genre_count: (callback) => {
            Genre.countDocuments({}, callback);
        }
    }, (err, results) => {
        res.render('index', {
            title: 'Local Library Home', 
            error: err, 
            data: results
        });
    });
};

exports.book_list = (req, res, next) => {
    Book.find({}, 'title author')
        .populate('author')
        .exec((err, list_books) => {
            if(err) {return next(err);}
            res.render('book_list', {title: 'Book List', book_list: list_books});
        });
};

exports.book_detail = (req, res, next) => {
    async.parallel({
        book: (cb) => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(cb);
        },
        book_instance: (cb) => {
            BookInstance.find({'book': req.params.id})
                .exec(cb);
        }
    }, (err, results) => {
        if(err) {
            next(err);
        }

        if(results.book == null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        res.render('book_detail', {
            title: 'Title',
            book: results.book,
            book_instances: results.book_instance
        });
    });
};

exports.book_create_get = (req, res, next) => {
    async.parallel({
        authors: (cb) => {
            Author.find(cb);
        },
        genres: (cb) => {
            Genre.find(cb);
        },
    }, (err, results) => {
        if(err) {
            return next(err);
        }
        res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres
        })
    });
};

exports.book_create_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)) {
            if(typeof req.body.genre==='undefined') {
                req.body.genre=[];
            } else {
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty.').isLength({ min: 1 }).trim(),

    sanitizeBody('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if(!errors.isEmpty()) {
            async.parallel({
                authors: (cb) => {
                    Author.find(cb);
                },
                genres: (cb) => {
                    Genre.find(cb);
                },
            }, (err, results) => {
                if(err) {
                    return next(err);
                }
    
                for(let i = 0; i < results.genres.length; i++) {
                    if(book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
    
                res.render('book_form', {
                    title: 'Create Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    errors: errors.array()
                });
            });
        } else {
            book.save((err) => {
                if(err) {
                    return next(err);
                }

                res.redirect(book.url);
            });
        }
    }
];

exports.book_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.book_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.book_update_get = (req, res, next) => {
    async.parallel({
        book: (cb) => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(cb);
        },
        authors: (cb) => {
            Author.find(cb);
        },
        genres: (cb) => {
            Genre.find(cb);
        }
    }, (err, results) => {
        if(err) {
            return next(err);
        }

        if(results.book == null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        for(var all_genre_idx = 0; all_genre_idx < results.genres.length; all_genre_idx++) {
            for(var book_genre_idx = 0; book_genre_idx < results.book.genre.length; book_genre_idx++) {
                if(results.genres[all_genre_idx]._id.toString() == results.book.genre[book_genre_idx]._id.toString()){
                    results.genres[all_genre_idx].checked='true';
                }
            }
        }

        res.render('book_form', {
            title: 'Update Book',
            authors: results.authors,
            genres: results.genres,
            book: results.book
        });
    });
};

exports.book_update_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)) {
            if(typeof req.body.genre==='undefined') {
                req.body.genre=[];
            } else {
                req.body.genre=new Array(req.body.genre);
            }
        }
        next();
    },

    body('title', 'Title must not be empty.').isLength({min: 1}).trim(),
    body('author', 'Author must not be empty.').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty.').isLength({min: 1}).trim(),
    body('isbn', 'ISBN must not be empty.').isLength({min: 1}).trim(),

    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id: req.params.id
        });

        if(!errors.isEmpty()) {
            async.parallel({
                authors: (cb) => {
                    Author.find(cb)
                }, 
                genres: (cb) => {
                    Genre.find(cb);
                }
            }, (err, results) => {
                if(err) {
                    return next(err);
                }
        
                for(var i = 0; i < results.genres.length; i++) {
                    if(book.genre.indexOf(results.genres[i]._id) > -1){
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', {
                    title: 'Update Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    errors: errors.array()
                });
            });
            return;
        } else {
            Book.findByIdAndUpdate(req.params.id, book, {}, (err, findBook) => {
                if(err) {
                    return next(err);
                }

                res.redirect(findBook.url);
            });
        }
    }
];