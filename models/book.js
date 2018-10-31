var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookSchema = new Schema({
    title: {type: String, required: true },
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String, required: true},
    isbn: {type:String, required: true},
    genre: [{ type: Schema.Types.ObjectId, ref: 'Genre'}]
});

BookSchema
    .virtual('url')
    .get(function() {
        return '/catalog/book/' + this._id;
    });

BookSchema
    .virtual('delete_url')
    .get(function() {
        return '/catalog/book/' + this._id + '/delete';
    });

BookSchema
    .virtual('update_url')
    .get(function() {
        return '/catalog/book/' + this._id + '/update';
    });

module.exports = mongoose.model('Book', BookSchema);