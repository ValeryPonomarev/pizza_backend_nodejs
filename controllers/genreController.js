var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

exports.genre_list = (req, res, next) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((err, genres) => {
            if(err) {
                next(err);
            }

            res.render('genre_list', {
                title: 'Genre List',
                genre_list: genres
            });
        });
};

exports.genre_detail = (req, res, next) => {
    async.parallel({
        genre: (cb) => {
            Genre.findById(req.params.id)
                .exec(cb);
        },
        genre_books: (cb) => {
            Book.find({'genre': req.params.id})
                .exec(cb);
        }
    }, (err, results)=> {
        if(err) {
            return next(err);
        }

        if(results.genre==null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', { 
            title: 'Genre Detail',
            genre: results.genre,
            genre_books: results.genre_books
        });
    });
};

exports.genre_create_get = (req, res) => {
    res.render('genre_form', {
        title: 'Create Genre'
    });
};

exports.genre_create_post = [
    body('name', 'Genre name required').isLength({ min: 1}).trim(),
    sanitizeBody('name').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre({
            name: req.body.name
        });

        if(!errors.isEmpty()) {
            res.render('genre_form', {
                title: 'Create Genre',
                genre: genre,
                errors: errors.array()
            });
            return;
        } else {
            Genre.findOne({'name': req.body.name})
                .exec((err, found_genre) => {
                    if(err) {
                        return next(err);
                    }

                    if(found_genre) {
                        res.redirect(found_genre.url);
                    } else {
                        genre.save((err) => {
                            if(err) {
                                return next(err);
                            }
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

exports.genre_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update POST');
};