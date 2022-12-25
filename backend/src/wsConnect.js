import MessageModel from './models/MessageModel'
import UserModel from './models/UserModel'
import ChatBoxModel from './models/ChatBoxModel'

const makeName = (name, to) => { return [name, to].sort().join('_')}

const validateUser = async (name) => {
    console.log("Finding..." + name)
    const existing =await UserModel.findOne({ name:name })
    if (existing) {
        return existing
    } else {
        const newUser = new UserModel({name: name});
        await newUser.save();
        return newUser
    }
}

const validateChatBox = async (name, sender, catcher) => {
    let box = await ChatBoxModel.findOne({ name });
    if (!box) {
        box = await new ChatBoxModel({ name:name}).save();
        // box = await new ChatBoxModel({ name:chatBoxName }).save();
        // const sender = await UserModel.findOne({ name:name })
        sender.chatBoxes.push(box._id)
        await sender.save()
        // const catcher = await UserModel.findOne({ name:to })
        catcher.chatBoxes.push(box._id)
        await catcher.save()
    }

    return box.populate(["users", {path: 'messages', populate: 'sender' }]);
};

const sendData = (data, ws) => { ws.send(JSON.stringify(data)); }
const sendStatus = (payload, ws) => { sendData(["status", payload], ws); }
const chatBoxes = {};

const broadcastMessage = (chatBoxName, data, status) => {
    chatBoxes[chatBoxName].forEach((client) => {
        sendData(data, client)
        sendStatus(status, client)
    });
}

export default {        
    // initData: (ws) => {
    //     Message.find().sort({ created_at: -1 }).limit(100)
    //     .exec((err, res) => {
    //         if (err) throw err;
    //         // initialize app with existing messages
    //         sendData(["init", res], ws);
    //     }); 
    // },
    onMessage: (wss, ws) => (
        async (byteString) => {
            const { data } = byteString
            const {type, payload} = JSON.parse(data)
            switch (type) {
                case 'CHAT':{
                    const {name, to} = payload
                    const chatBoxName = makeName(name, to)
                    const sender = await validateUser(name)
                    const catcher = await validateUser(to)
                    
                    const box = await validateChatBox(chatBoxName, sender, catcher)
                    if (!chatBoxes[chatBoxName]){
                        chatBoxes[chatBoxName] = new Set();
                    }
                        
                    chatBoxes[chatBoxName].add(ws);

                    let res = []
                    if (box.messages.length !== 0) {
                        res = box.messages.map((msg) => ({name: msg.sender.name, body: msg.body}))
                    }
                    broadcastMessage(
                        chatBoxName,
                        ["init", res], {
                        type: 'success',
                        msg: 'Message sent.' 
                    })
                    ws.box = chatBoxName
                    break
                }
                case 'MESSAGE': {
                    const { name, to, body } = payload
                    // Save payload to DB
                    const chatBoxName = makeName(name, to)
                    const sender = await validateUser(name)
                    const box = await validateChatBox(chatBoxName)
                    
                    const message = new MessageModel({ chatBox:box._id, sender:sender._id, body })
                    
                    try { await message.save();
                        box.users.push(sender._id)
                        box.messages.push(message._id)
                        await box.save()
                    } catch (e) { throw new Error ("Message DB save error: " + e); }
                    // Respond to client
                    broadcastMessage(
                        chatBoxName,
                        ["output", [{name: name, body:body}]],
                        {
                            type: 'success',
                            msg: 'Message sent.' 
                        }
                    )
                    break
                }
                case 'clear': {
                    Message.deleteMany({}, () => {
                        broadcastMessage(
                            wss,
                            ["cleared"],
                            { type: 'info', msg: 'Message cache cleared.'}
                        )
                    })
                    break
                }
                default: break
            }
        }
    )
}