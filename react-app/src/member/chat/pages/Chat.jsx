import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from "react";
import { useUser } from "../../../general/user/contexts/LoginContextProvider";
import axios from 'axios';
import styles from '../css/Chat.module.css';
import { Flex, Image } from '@chakra-ui/react';
import ChatBot from '../../../assets/images/schedule/chatbot.webp';
import Bot from '../../../assets/images/schedule/bot.webp';
import Send from '../../../assets/images/schedule/send.webp';
import Spin from '../../../assets/images/schedule/spin.webp';
import Help from '../../../assets/images/schedule/help.webp';


const Chat = (props) => {
  const {userInfo} = useUser();
  const [loading, setLoading] = useState(false);
  const initialMessages = [{ sender: 'Lumi', text: `안녕하세요!<br/> 어떤 여행지를 추천해드릴까요?` }];
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const backUrl = process.env.REACT_APP_BACK_URL;
  const textAreaRef = useRef(null);

  // 메시지 배열이 변경될 때마다 스크롤을 조정
  useEffect(() => {
    scrollToBottom();
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [chatHistory]); 

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return; // 빈 메시지를 전송하지 않도록
    }

    const token = Cookies.get('accessToken');
    if (!token) {
      console.error("토큰을 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    const newChatHistory = [...chatHistory, { sender: userInfo.name, text: message }];
    setChatHistory(newChatHistory);
    scrollToBottom();
    setMessage('');
    setLoading(true);
      try {
        const chatData = { message };
          const response = await axios.post(`${backUrl}/chat`, chatData, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          //Cohere API 응답을 채팅 히스토리에 추가
          setChatHistory([...newChatHistory, { sender: "Lumi", text: response.data.replaceAll("(?s)\\R\\R\\d+\\.\\s.*$", "") }]);
          scrollToBottom();
        } catch (error) {
          console.error('Error sending message', error);
          setChatHistory([...newChatHistory, { sender: "Lumi", text: "다시 한 번 더 말씀해주세요." }]);
          scrollToBottom();
          
      }finally {
        setLoading(false); // 요청 완료 후 로딩 상태 해제
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Enter 키의 기본 동작 방지 (예: 폼 제출)
      handleSendMessage(); // 메시지 전송
    }
  };
  
  const chatContainerRef = useRef(null);
    // 메시지가 추가된 후 자동으로 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth' // 부드러운 스크롤
      });
    }
  };

    return (
        <>
          <div className={styles.btn}>
            <Image id={styles.help} src={Help}/>
            <div id={styles.helptext}>
              Lover Air의 귀염둥이 <br/>Lumi에게 궁금한 것을 물어보세요~
            </div>
          </div>
          <div id={styles.chatBox}>
            <div id={styles.titleBox}>
              <Flex justifyContent='start' alignItems='center'>
                <Image src={ChatBot} className={styles.botIcon} />
                <div id={styles.title}>Lumi</div>
              </Flex>
            </div>
            <div id={styles.chatIn} ref={chatContainerRef}>
              {chatHistory.map((chat, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  { chat.sender !== 'Lumi' ? 
                    (<div>
                      <Flex justifyContent='end'>
                        <Image borderRadius='full' boxSize='40px' objectFit='cover' src={props.activeUsersPic} border='2px solid #ffa9e8' />
                      </Flex>
                      <Flex justifyContent='end'>
                        <div dangerouslySetInnerHTML={{ __html: chat.text }} className={styles.contentUser}/>
                      </Flex>
                    </div>)
                  : (<div>
                      <Image borderRadius='full' boxSize='40px' objectFit='cover' src={Bot} border='2px solid #3791f9' backgroundColor= '#3791f9'/>
                      <div dangerouslySetInnerHTML={{ __html: chat.text }} className={styles.contentBot}/>
                    </div>)}
                </div>
              ))}
            </div>
            <Flex w='280px' h='50px' mb='-1px' ml='-1px'>
              <textarea id={styles.input}
                ref={textAreaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading} // 로딩 중일 때 입력 비활성화
              />
              <button id={styles.chatbtn} onClick={handleSendMessage}>
               <Image src={loading ? Spin : Send} className={`${styles.send} ${loading ? styles.spin : ''}`}/>
              </button>
            </Flex>
          </div>
        </>
    );
};

export default Chat;
