import mongoose from 'mongoose';
const Schema = mongoose.Schema

/******* ChatBox Schema *******/
const ChatBoxSchema = new Schema({
    name: { type: String, required: [true, 'Name field is required.'] },
    messages: [{ sender: {type: String},
                 body: {type: String}  }]
    // messages: [{ type: mongoose.Types.ObjectId, ref: 'Message' }]
});
const ChatBoxModel = mongoose.model('simplifyChatBox', ChatBoxSchema);

export default ChatBoxModel