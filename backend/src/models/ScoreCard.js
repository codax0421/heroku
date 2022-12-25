import mongoose from 'mongoose'
import { ObjectId } from 'mongoose';


const Schema = mongoose.Schema;
const ScoreCardSchema = new Schema({

 Name: String,
 Subject: String,
 Score: String,

});
const ScoreCard = mongoose.model('ScoreCardSchema', ScoreCardSchema);
export default ScoreCard;