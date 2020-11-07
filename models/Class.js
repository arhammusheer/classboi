var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;

var ClassSchema = new Schema({
    description: String,
    syllabus: String,
    meetings: Array,
});

global.ClassSchema =
	global.ClassSchema || mongoose.model("Class", ClassSchema);
module.exports = global.ClassSchema;
