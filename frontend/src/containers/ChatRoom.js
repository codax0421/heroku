import '../App.css'
import { Input, Tabs } from 'antd'
import { useChat } from './hooks/useChat'
import { useState, useEffect, useRef } from "react";
import styled from "styled-components"
import Title from '../components/Title';
import Message from '../components/Message';
import ChatModal from '../components/ChatModal';
import { useQuery, useMutation } from "@apollo/client";
import { CHATBOX_QUERY, CREATE_CHATBOX_MUTATION, CREATE_MESSAGE_MUTATION, MESSAGE_SUBSCRIPTION } from "../graphql";

const ChatBoxesWrapper = styled(Tabs)`
  width: 100%;
  height: 300px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 20px;
  padding: 20px;
  overflow: auto;
`

const ChatBoxWrapper = styled.div`
  height: calc(240px - 36px);
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;
`

const FootRef = styled.div`
  height: 20px;
`

const ChatRoom = () => {
  const { me, messages, startChat, sendMessage, displayStatus, friend, setFriend, data } = useChat()
  const [msg, setMsg] = useState('')
  const [msgSent, setMsgSent] = useState(false)
  const [activeKey, setActiveKey] = useState('')
  const [chatBoxes, setChatBoxes] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  const msgRef = useRef(null)
  const msgFooter = useRef(null)
  
  const displayChat = (chat) => (
    chat.length === 0 ? (
      <p style={{color: '#ccc'}}> No messages... </p>
    ) : (
    <ChatBoxWrapper>{
      chat.map(({ sender:name, body }, i) => (
        <Message isMe={name === me} message={body} key={i} />
      ))}
      <FootRef ref={msgFooter} />
    </ChatBoxWrapper>
    )
  )
  
//   const { data, loading, subscribeToMore }
//   = useQuery(CHATBOX_QUERY, {
//       variables: {
//           name1: me,
//           name2: friend,
//       },
//   });
//   useEffect(() => {
//     console.log('subscribeToMore111')
// }, [subscribeToMore])
  const extractChat = (friend) => {
    // return displayChat(messages.filter(({sender, body}) => ((sender === friend) || (sender === me))))
    return displayChat(messages)
  }

  const createChatBox = (friend) => {
    startChat(me, friend)
    if (chatBoxes.some
        (({key}) => key === friend)) {
            throw new Error(friend + "'s chat box has already opened.");
    }
    
    return friend;
  };

  const removeChatBox = (targetKey, activeKey) => {
    const index = chatBoxes.findIndex
        (({key}) => key === activeKey);
    const newChatBoxes = chatBoxes
        .filter(({key}) => key !== targetKey);
    setChatBoxes(newChatBoxes);
    return (activeKey ?
        ( activeKey === targetKey ?
            (index === 0 ? '' : chatBoxes[index - 1].key)
            : activeKey ) : '');
    };

  const scrollToBottom = () => {
    msgFooter.current?.scrollIntoView
    ({ behavior: 'smooth', block: 'start'})
  }
  
  useEffect(() => {
    scrollToBottom()
    setMsgSent(false)}, [msgSent])
  
  useEffect(() => {
    if (activeKey !== '' && data.chatbox.messages){
      const chat = extractChat(activeKey);
      if (chatBoxes.some (({key}) => key === activeKey)) {
        const index = chatBoxes.findIndex(({key}) => key === activeKey);
        chatBoxes[index].children = chat
        setChatBoxes(chatBoxes)
        setMsgSent(true)
      } else {
        setChatBoxes([...chatBoxes, { label: activeKey, children: chat, key: activeKey }]);
        setMsgSent(true)
      }
    }
    }, [messages])
  
  return (
    <>
    <Title name={me} />
    <>
      <ChatBoxesWrapper
        tabBarStyle={{ height: '36px' }}
        type='editable-card'
        activeKey={activeKey}
        onChange={(key) => {
          startChat(me, key)
          setActiveKey(key);
          setFriend(key);
          extractChat(key);
        }}
        onEdit={(targetKey, action) => {
            if (action === 'add') setModalOpen(true);
            else if (action === 'remove') {
                setActiveKey(removeChatBox(targetKey, activeKey));
                setFriend(removeChatBox(targetKey, activeKey))
                
            }
            }}
        items={chatBoxes}
        />
        <ChatModal
            open={modalOpen}
            onCreate={({ name }) => {
                setActiveKey(createChatBox(name));
                setFriend(name)
                extractChat(name);
                setModalOpen(false);
            }}
            onCancel={() => { setModalOpen(false);}}
        />
        </>
      <Input.Search
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          enterButton="Send"
          placeholder="Type a message here..."
          onSearch={(msg) => {
              if (!msg) {
                  displayStatus({
                      type: 'error',
                      msg: 'Please enter a message.'
                  });
                  return;
              } else if (activeKey === '') {
                displayStatus({
                    type: 'error',
                    msg: 'Please add a chatbox first.'
                })
                setMsg('');
                return;
              }
              sendMessage({ name: me, body: msg, to: activeKey});
              setMsg('');
              setMsgSent(true);
          } }
      ></Input.Search></>
  )
}

export default ChatRoom
