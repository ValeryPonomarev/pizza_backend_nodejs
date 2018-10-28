var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

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

exports.book_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create GET');
};

exports.book_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create POST');
};

exports.book_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.book_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.book_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update GET');
};

exports.book_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update POST');
};