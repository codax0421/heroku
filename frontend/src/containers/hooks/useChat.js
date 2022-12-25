import { useQuery, useMutation } from "@apollo/client";
import { CHATBOX_QUERY, CREATE_CHATBOX_MUTATION, CREATE_MESSAGE_MUTATION, MESSAGE_SUBSCRIPTION } from "../../graphql";
import { createContext, useContext, useState, useEffect } from "react";
import { message } from 'antd'

const LOCALSTORAGE_KEY = 'save-me'; // can randomly name the key.
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatContext = createContext({
    status: {},
    me: "",
    friend: "",
    signedIn: false,
    messages: [],
    startChat: () => {},
    sendMessage: () => {},
    clearMessages: () => {},
    displayStatus: () => {},
});
// const client = new WebSocket('ws://localhost:4000')
// client.onopen = () => console.log("Backend socket server connected!")

const ChatProvider = (props) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState({});
    const [me, setMe] = useState(savedMe || "");
    const [friend, setFriend] = useState("");
    const [signedIn, setSignedIn] = useState(false);
    // const [subscribeToMore, setSubscribeToMore] = useState()
    useEffect(() => {
        if (signedIn) {
        localStorage.setItem(LOCALSTORAGE_KEY, me);
        }
    }, [me, signedIn]);
    // const { loading, error, data, subscribeToMore } = useQuery(CHATBOX_QUERY)
    // https://stackoverflow.com/questions/62587993/how-to-render-usequery-both-on-first-render-and-onclick-reactjs-graphql
    // my subscribeToMore can't not rerender
    const { data, loading, subscribeToMore }
    = useQuery(CHATBOX_QUERY, {
        variables: {
            name1: me,
            name2: friend,
        },
    });
    useEffect(() => {
        console.log('change')
    }, [friend])
    useEffect(() => {
        console.log('j0')
        console.log(data)
        // setMessages(data.chatbox.messages)
        if (data && data.chatbox && data.chatbox.messages){
            setMessages(data.chatbox.messages)
        }
    }, [data && data.chatbox && data.chatbox.messages])

    useEffect(() => {
        try {
            subscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                variables: { from: me, to: friend },
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessage = subscriptionData.data.message;
                    console.log(newMessage)
                    console.log(prev)
                    console.log('newMessage')
                    
                    return {
                        ...prev,
                        chatbox:{
                            name:[me, friend].sort().join('_'),
                            messages: [...prev.chatbox.messages, newMessage]
                        }
                    };
                },
                
            });
        } catch (e) {console.log(e)}
        }, [me, friend]);


    const [gqlstartChat] = useMutation(CREATE_CHATBOX_MUTATION);
    const [gqlsendMessage] = useMutation(CREATE_MESSAGE_MUTATION);
    const clearMessages = () => {
        // sendData({type: "clear"});
    }
    // before client will send task type to backend and wsConnect will deal with it
    // const sendData = async (data) => {
    //     await client.send(JSON.stringify(data));
    // };

    // const startChat = (name, to) => {
    //     if (!name || !to) throw new Error('Name or to required.')

    //     sendData({
    //         type: "CHAT",
    //         payload: { name, to },
    //     })
    // }
    // use GraphQL to achieve it

    const startChat = async(name, to) => {
        if (!name || !to) throw new Error('Name or to required.')
        
        const data = await gqlstartChat({
            variables: {
              name1: name,
              name2: to
            }
        })
        // console.log(data.data.createChatBox.messages)
        // setMessages(data.data.createChatBox.messages)
    }

    const sendMessage = async({name, to, body}) => {
        if (!name || !to || !body)
            throw new Error('Name or to or body required.')
        // sendData({
        //     type: "MESSAGE",
        //     payload: { name, to, body },
        // })
        gqlsendMessage({variables: { name, to, body}});
        // setMessages([...messages, data.data.createMessage]);
    }

    const displayStatus = (s) => {
        if (s.msg) {
          const { type, msg } = s;
          const content = {
            content: msg, duration: 0.5 }
          switch (type) {
          case 'success':
            message.success(content)
            break
          case 'error':
          default:
            message.error(content)
            break
        }}}

    // client.onmessage = (byteString) => {
    //     const { data } = byteString;
    //     const [task, payload] = JSON.parse(data);
        
    //     switch (task) {
    //         case "init": {
    //             setMessages(payload)
    //             break;
    //         }
    //         case "output": {
    //             setMessages(() => [...messages, ...payload]); 
    //             break;
    //         }
    //         case "cleared": {
    //             setMessages([]);
    //             break;
    //         }
    //         case "status": { setStatus(payload); break; }
    //         default: {break;}
    //     }
    // }

    return (
        <ChatContext.Provider
        value={{
        status, me, signedIn, messages, setMe, setSignedIn,
        startChat, sendMessage, clearMessages, displayStatus, setFriend, data
        }}
        {...props}
        />
    )
};

const useChat = () => useContext(ChatContext)

export { ChatProvider, useChat };