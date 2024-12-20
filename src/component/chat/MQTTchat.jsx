import React, { useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt';
import { format } from "date-fns";
import { useRouter } from 'next/router';


const MQTTchat = ({listenURL, port, settingNode, chatNode, course_id, isPublic, locked_room, key, getMQTTPollData}) => {
  

    const [client, setClient] = useState(null);
    const [connectStatus, setConnectStatus] = useState(null);
    const [input, setInput] = useState('')
    const [chatData, setChatData] = useState([])
    const [userId, setUserId] = useState('')
    const [isLocked, setIsLocked] = useState('')
    const [lockUserId, setLockUserId] = useState('')
    const chatContainerRef = useRef(null);
    const [roomLocked, setRoomLocked] = useState(locked_room)
    const [privateChat, setPrivateChat] = useState('')
    const [showEmojis, setShowEmojis] = useState(false);
    const [reactions, setReactions] = useState([]);

    const router = useRouter()

  ////////////////// MQTT Connection ////////////////
  
    const mqttConnect = (host) => {
      const jwt = localStorage.getItem("jwt");
      const userName = localStorage.getItem("userName");
      const user_id = localStorage.getItem("user_id");
      const options = {
        clientId: user_id, // Use USER_ID as the clientId
        username: userName,   // Use Name as the username
        password: jwt,
        clean: true,
      };
        // console.log('options', options)
        setConnectStatus("Connecting");
        const MQTTClient = mqtt.connect(host ,options)
        setClient(MQTTClient);
        // console.log('MQTTClient', MQTTClient)
        if (MQTTClient) {
          if(!MQTTClient.subscribed) {
            MQTTClient.on("connect", () => {
              // console.log('connect', chatNode)
              setConnectStatus("Connected");
              MQTTClient.subscribe(chatNode, { qos: 2 }, (err) => {
                if (err) {
                  console.error("Subscription error:", err);
                } else {
                  // console.log('')
                  // console.log(`Subscribed to chatNode "${chatNode}"`);
                  // getChatData();
                  getMQTTPollData(MQTTClient, chatNode)
                }
              });
        
              MQTTClient.subscribe(settingNode, { qos: 2 }, (err) => {
                if (err) {
                  console.error("Subscription error:", err);
                } else {
                  // console.log('')
                  // console.log(`Subscribed to settingNode "${settingNode}"`);
                  // getUserData()
                }
              });
              MQTTClient.subscribed = true;
            });
          }
      
          MQTTClient.on("error", (err) => {
            console.error("Connection error: ", err);
            MQTTClient.end();
          });
      
          MQTTClient.on("reconnect", () => {
            setConnectStatus("Reconnecting");
          });
        }
      };

      // console.log('isPublic', isPublic)
      

      // console.log('client', client)
      ////////////////// MQTT Connection Credential ////////////////

  // const brokerUrl = `wss://mqtt-ws.videocrypt.in:8084/mqtt`;
  // const brokerUrl = `wss://chat-ws.videocrypt.in:8084/mqtt`;
  const brokerUrl = listenURL; 
  // const brokerUrl = `wss://${listenURL}:${port}`

  useEffect(() => {
    if(router.pathname.startsWith('/private/myProfile/play')) {
      mqttConnect(brokerUrl);
    }
  }, []);

  ////////////////// getting data from MQTT ////////////////

  useEffect(() => {
    if (client) {
      getChatData()
      getUserData()
      // setPrivateChat(isPublic)
    }
  }, [client]);


  useEffect(() => {
    // Scroll to the bottom when chatData changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatData]);
  
  const getChatData = () => {
    // console.log('getChatData')
    const user_id = localStorage.getItem("user_id");
    client.on("message", (chatNode, message) => {
        console.log(`Received message on topic "${chatNode}": ${message}`);
        if(JSON.parse(message.toString())?.type == "text"){
          // console.log("rrrrrr", JSON.parse(message.toString()))
          const chatType = localStorage.getItem('chatType')
          // console.log('chatType',chatType)
          if(chatType == "public_chat") {
            // console.log('11111111')
            setChatData((prevChatData) => [
                ...prevChatData,
                JSON.parse(message.toString()), // Parse the message if it's JSON
            ]);
          }
          else {
            // console.log('22222222')
            if(JSON.parse(message.toString())?.platform == '0' || JSON.parse(message.toString())?.id == user_id) {
              // console.log('3333333')
              setChatData((prevChatData) => [
                ...prevChatData, 
                JSON.parse(message.toString())
              ])
            }
          }
        }
        else {
          if(JSON.parse(message.toString())?.type == "public_chat" || JSON.parse(message.toString())?.type == "private_chat"){
            console.log('here', JSON.parse(message.toString())?.type)
            setPrivateChat(JSON.parse(message.toString())?.type)
            localStorage.setItem('chatType', JSON.parse(message.toString())?.type);
          }
          else if(JSON.parse(message.toString())?.type == "user_lock" || JSON.parse(message.toString())?.type == "user_unlock") {
            setIsLocked(JSON.parse(message.toString())?.type)
            setRoomLocked(JSON.parse(message.toString())?.type)
            setLockUserId(JSON.parse(message.toString())?.locked_user_id)
          }
          // const chats = JSON.parse(message.toString()).filter((chat) => ())
          else if(JSON.parse(message.toString())?.type == 'emojiReaction') {
            addReaction(JSON.parse(message.toString())?.message)
          }
        }
    });
  };

  const getUserData = () => {
    // console.log('getUserData')
    client.on("message", (settingNode, message) => {
      // console.log(`Received message on topic "${settingNode}": ${message}`);
      // console.log('')
      if(JSON.parse(message.toString())?.type == "user_unlock" || JSON.parse(message.toString())?.type == "user_lock"){
        setIsLocked(JSON.parse(message.toString())?.type)
        setRoomLocked(JSON.parse(message.toString())?.type)
        setLockUserId(JSON.parse(message.toString())?.locked_user_id)
      }
    });
  }

  const convertToTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.getTime(); // Convert milliseconds to seconds
  };

  const formatTime = (date) => {
    const cr_date = new Date(date);
    if (cr_date) {
      return format(cr_date, "dd MMM yyyy h:mm a");
    }
  };

  // console.log('chatData', chatData)

  const handleMessge = (e) => {
    e.preventDefault();
    const app_id = localStorage.getItem("appId");
    const user_id = localStorage.getItem("user_id");
    const userName = localStorage.getItem("userName");
    setUserId(localStorage.getItem("user_id"))
    // console.log('hi', input)
    const curr_date = new Date();
    if (input) {
      let msgObject = JSON.stringify({
        id : user_id,
        message : input,
        name : userName,
        date : convertToTimestamp(curr_date),
        platform : '4',
        type : 'text',
        course_id : course_id,
        pin: '0',
        is_active: '1'
      });
      client.publish(chatNode, msgObject, { qos: 1 }, (err) => {
        if (err) {
          console.error("Error publishing message:", err);
        } else {
          console.log(` Message published to topic "${chatNode}": ${input}`);
          // getChatData()
        setInput('')
        }
      });
    }
  };

  useEffect(() => {
    if(router.pathname.startsWith != "/private/myProfile/play/") {
      handleUserOfflineMQTT()
    }
  }, [router.pathname])


  const handleUserOfflineMQTT = () => {
      try {
          // // const brokerUrl = `wss://mqtt-ws.videocrypt.in:8084/mqtt`;
          // const brokerUrl = `wss://chat-ws.videocrypt.in:8084/mqtt`;
          // // const brokerUrl = `wss://${listenURL}:${port}`
          const jwt = localStorage.getItem("jwt");
          const chatNode = localStorage.getItem("chat_node");
          const settingNode = localStorage.getItem("setting_node");
          const options = {
              clientId: localStorage.getItem("user_id"),
              username: localStorage.getItem("userName"),
              password: jwt,
          };
          // const MQTTClient = mqtt.connect(brokerUrl, options);

          client.unsubscribe(chatNode, (err) => {
              if (!err) console.log(`Unsubscribed from ${chatNode}`);
          });
          client.unsubscribe(settingNode, (err) => {
              if (!err) console.log(`Unsubscribed from ${settingNode}`);
          });
          client.removeEventListener()
          client.end(() => console.log("Disconnected2 from MQTT."));
      } catch (error) {
          console.error("Error during MQTT unsubscription:", error);
      }
  };


  {/*Emoji Reaction */}

  const addReaction = (emoji) => {
    const id = Date.now();
    setReactions((prev) => [...prev, { id, emoji }]);

    // Remove reaction after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((reaction) => reaction.id !== id));
    }, 3000); // Animation duration
  };

  const reactionStyle = {
    position: "absolute",
    right: "10px", // Fixed position on the right side
    bottom: "0",
    transform: "translateX(0)", // No horizontal movement
    animation: "float 1s ease-in forwards",
    fontSize: "24px",
    pointerEvents: "none", // To prevent interaction
  };



  return ( <>
    <div className="chat-conversation" >
        {/* {console.log('caht', chatData)} */}
        <div className="simplebar-content-wrapper">
          <div
            className="simplebar-content live-content"
            style={{ overflowY: "hidden" }}
            ref={chatContainerRef}
          >
            <ul
              className="list-unstyled chat-conversation-list"
              id="chat-conversation-list"
            >
              {chatData?.length > 0 &&
                chatData.map((chat, index) => (
                  (chat?.type == 'text' && chat?.message != "")  &&
                  <div
                    key={index}
                    className={`chat-list ${userId === chat.id ? "right" : "left"}`}
                  >
                     <div className="conversation-list">
                      <div className="user-chat-content">
                        <div className="ctext-wrap">
                          <div
                            className={`ctext-wrap-content ${
                              userId === chat.id ? "" : "left-in"
                            }`}
                          >
                            <p className="mb-0 ctext-content-live">
                              <h5 className="conversation-name mb-2">
                                {chat.name}
                              </h5>

                              {chat?.type == "text" && chat?.message}
                              {chat?.type == "image" && (
                                <img src={chat?.message} className="w-100" alt="" />
                                )}
                                {chat?.type == "pdf" && (
                                <div
                                    onClick={() => handlePdf(chat?.message)}
                                    style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: "10px",
                                    cursor: "pointer",
                                    }}
                                >
                                    <FaRegFilePdf size={24} color="red" />{" "}
                                    <span style={{ marginLeft: "10px" }}>
                                    {chat?.message.substring(
                                        chat?.message.lastIndexOf("/") + 1
                                    ) || "No PDF selected"}
                                    </span>
                                </div>
                                )}
                              {chat?.type == "audio" && <AudioPlayer
                                  audioUrl={chat?.message}
                                  userName="Ankur Tiwari"
                                  duration={chat?.date && formatTime(chat?.date)}
                                />
                                }
                            </p>
                          </div>
                        </div>
                        <div className="left-time">
                          <small
                            className="dropdown-btn text-muted mb-0 ms-2"
                            tabIndex="0"
                          >
                            {chat?.date && formatTime(chat?.date)} 
                            {/* {" "}|{" "} */}
                            {/* <i className="bi bi-three-dots-vertical"></i> */}
                          </small>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                ))}
            </ul>
          </div>
        </div>
      </div>
      {/* {console.log('isLocked', isLocked)}
      {console.log('roomLocked', roomLocked)} */}
      {roomLocked != "room_lock" && (
        isLocked != "user_lock" &&
        <form className="chat_input pt-1 pb-0 p-0" onSubmit={handleMessge}>
          <div className="input-group">
            <input
              className="border-0 input_field form-control"
              type="text"
              value={input} // Disable text if image is selected
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type Something..."
            />
          </div>
          <button
            className="btn p-0 text-white"
            style={{ width: "15%" }}
            type="submit"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="52" height="52" rx="10" fill="#526170" />
              <rect
                width="52"
                height="52"
                rx="10"
                fill="url(#paint0_linear_6730_5285)"
              />
              <path
                d="M17.8473 19.0156L29.4356 15.169C34.636 13.4429 37.4614 16.27 35.7416 21.4485L31.8788 32.988C29.2854 40.749 25.0268 40.749 22.4335 32.988C21.7117 30.8318 20.0053 29.1375 17.8473 28.4212C10.0535 25.8387 10.0535 21.6116 17.8473 19.0156Z"
                fill="white"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.1387 31.4476L23.4367 28.1543"
                stroke="#F67100"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_6730_5285"
                  x1="4.97391"
                  y1="-10.9032"
                  x2="-22.5706"
                  y2="18.7151"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.034523" stopColor="#F4780E" />
                  <stop offset="0.944296" stopColor="#EF991C" />
                </linearGradient>
              </defs>
            </svg>
          </button>
          {/*  Emoji Reaction  */}
          <div className="reaction-container">
            {reactions.map((reaction) => (
               <div
               key={reaction.id}
               style={{
                 ...reactionStyle,
                 animationDelay: `${Math.random() * 0.1}s`, // Stagger animations
               }}
             >
               {reaction.emoji}
             </div>
            ))}
          </div>
          {showEmojis && (
            <div className="emojis">
              <span onClick={() => addReaction("👍")} style={{cursor: 'pointer'}}>👍</span>
              <span onClick={() => addReaction("❤️")} style={{cursor: 'pointer'}}>❤️</span>
              <span onClick={() => addReaction("😂")} style={{cursor: 'pointer'}}>😂</span>
              <span
                variant="outline-gray"
                size="small-square"
                onClick={() => addReaction("🔥")}
                style={{cursor: 'pointer'}}
              >
                🔥
              </span>
            </div>
          )}
          <div className="input-group-append" onClick={() => setShowEmojis(!showEmojis)}>
            <span
              className="input-group-text border-0 rounded-0 rounded-end"
              style={{ padding: "9px 5px", background: "#F5F5F5", cursor: 'pointer' }}
            >
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6730_5295)">
                  <path
                    d="M23.9997 11.2915V12.6979C23.9819 12.7641 23.9683 12.8314 23.9589 12.8993C23.8616 14.5578 23.393 16.1733 22.5875 17.6263C20.3786 21.5568 17.0083 23.6985 12.5031 23.9757C10.3753 24.1165 8.2526 23.636 6.39292 22.5926C2.44496 20.3925 0.303169 17.0135 0.0201293 12.5024C-0.114389 10.3689 0.367771 8.24175 1.40907 6.37476C2.25436 4.76054 3.46139 3.36359 4.93588 2.29303C6.41037 1.22247 8.11239 0.507284 9.90901 0.203336C10.3671 0.115798 10.834 0.0749485 11.2979 0.0136719H12.7044C12.7633 0.0321773 12.8239 0.0448789 12.8853 0.051602C14.338 0.138214 15.7597 0.508986 17.0696 1.14291C20.7637 2.95203 23.0193 5.88164 23.81 9.92589C23.9005 10.3665 23.9384 10.8334 23.9997 11.2915ZM11.9983 1.49598C9.92065 1.49598 7.88972 2.11206 6.16225 3.26632C4.43478 4.42058 3.08838 6.06116 2.29332 7.98062C1.49825 9.90008 1.29023 12.0122 1.69555 14.0499C2.10088 16.0876 3.10133 17.9593 4.57042 19.4284C6.03951 20.8975 7.91125 21.8979 9.94894 22.3033C11.9866 22.7086 14.0987 22.5006 16.0182 21.7055C17.9376 20.9104 19.5782 19.564 20.7325 17.8366C21.8867 16.1091 22.5028 14.0781 22.5028 12.0005C22.502 9.21506 21.395 6.54394 19.4251 4.57458C17.4552 2.60522 14.7837 1.4989 11.9983 1.4989V1.49598Z"
                    fill="#969696"
                  />
                  <path
                    d="M5.24023 12.0098H6.72841C6.72841 13.4059 7.28297 14.7448 8.27015 15.7319C9.25734 16.7191 10.5962 17.2737 11.9923 17.2737C13.3884 17.2737 14.7273 16.7191 15.7145 15.7319C16.7017 14.7448 17.2563 13.4059 17.2563 12.0098H18.7474C18.6715 14.3295 17.7494 16.2233 15.8294 17.5276C13.5826 19.0537 11.1607 19.1908 8.78261 17.9069C6.49203 16.6697 5.35987 14.6359 5.24023 12.0098Z"
                    fill="#969696"
                  />
                  <path
                    d="M6.75198 8.25857C6.75024 7.96144 6.8368 7.6705 7.00067 7.42264C7.16455 7.17478 7.39835 6.98119 7.67242 6.86641C7.94649 6.75164 8.24848 6.72085 8.54007 6.77797C8.83166 6.83509 9.09971 6.97753 9.31023 7.18722C9.52074 7.39691 9.66423 7.66441 9.72249 7.95577C9.78074 8.24714 9.75113 8.54924 9.63743 8.82376C9.52372 9.09827 9.33105 9.33283 9.08383 9.49767C8.83662 9.66251 8.54601 9.75021 8.24888 9.74963C7.85405 9.74586 7.47636 9.58773 7.19661 9.30908C6.91687 9.03043 6.7573 8.65338 6.75198 8.25857Z"
                    fill="#969696"
                  />
                  <path
                    d="M15.7507 9.74964C15.4535 9.7502 15.1628 9.66243 14.9155 9.49746C14.6682 9.33248 14.4755 9.09776 14.3619 8.82307C14.2483 8.54838 14.2189 8.24613 14.2774 7.95469C14.3359 7.66325 14.4796 7.39575 14.6904 7.18618C14.9013 6.97661 15.1696 6.8344 15.4614 6.77762C15.7531 6.72084 16.0552 6.75204 16.3292 6.86726C16.6032 6.98249 16.8368 7.17653 17.0004 7.42477C17.1639 7.67301 17.2499 7.96424 17.2476 8.26149C17.2423 8.65602 17.0826 9.03277 16.8028 9.31095C16.523 9.58914 16.1453 9.74662 15.7507 9.74964Z"
                    fill="#969696"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6730_5295">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </div>
        </form>
      )}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-50px) scale(1.2);
            }
            100% {
              transform: translateY(-200px) scale(0.8);
              opacity: 0;
            }
          }
        `}
      </style>
    </>
  )
}

export default React.memo(MQTTchat)