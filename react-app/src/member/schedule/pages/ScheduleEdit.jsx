import React, { useContext, useEffect, useRef, useState } from 'react';
import webSocketService from './WebSocketService';
import style from '../CSS/ScheduleEdit.module.css';
import Cookies from 'js-cookie';
import * as Swal from '../../../apis/alert';
import { LoginContext } from '../../../general/user/contexts/LoginContextProvider';
import { useNavigate, useParams  } from 'react-router-dom';
import { Input } from '@chakra-ui/react';
import axios from 'axios';
import ScheduleEditPart from '../component/ScheduleEditPart';

const ScheduleEdit = () => {
    const { userInfo } = useContext(LoginContext);
    const {id} = useParams();
    const [title, setTitle] = useState([]);
    const [shareUsername, setShareUsername] = useState("");
    const [shareTeam, setShareTeam] = useState([]);
    const [activeUsersPic, setActiveUsersPic] = useState([]);
    const token = Cookies.get('accessToken');
    const titleRef = useRef(null);
    const titleInputRef = useRef(null);
    const titleWarningRef = useRef(null);
    const sharePopoverRef = useRef(null);
    const shareNoticeMessageRef = useRef(null);
    const backUrl = process.env.REACT_APP_BACK_URL;
    
    const navigate = useNavigate();
    useEffect(()=>{
        if(!userInfo.id) return;
        getTeam();
    }, [userInfo]);
    
    const getTeam = () => {
        axios({
            method: "get",
            url: `${backUrl}/schedule/team/` + id,
        })
        .then(response => {
            const {data, status, statusText} = response;
            data.some(e => e.username === userInfo.username) 
                || Swal.alert("이 문서를 편집하거나\n열람할 권한이 없습니다.", "메인화면으로 이동합니다", "error", () => { navigate("/") });
            setShareTeam(data);
        });
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sharePopoverRef.current && !sharePopoverRef.current.contains(event.target)) {
                sharePopoverRef.current.classList.add(`${style.opacityZero}`);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sharePopoverRef]);

    const changeValue = (e) => {
        e.target.name === "title" && setTitle(e.target.value);
        e.target.name === "shareusername" && setShareUsername(e.target.value);
    };

    const handleInput = () => {
        if(title.length > 30){
            titleWarningRef.current.classList.remove(`${style.hidden}`);
            return;
        }

        titleInputRef.current.blur();
        titleInputRef.current.classList.add(`${style.hidden}`);
        titleWarningRef.current.classList.add(`${style.hidden}`);
        titleRef.current.classList.remove(`${style.hidden}`);
        handleContentChange();
    }

    useEffect(() => {
        fetch(`${backUrl}/title/${id}`)
            .then(response => response.json())
            .then(data => setTitle(data.title));

        webSocketService.connect((newContent) => {
            if (newContent.title) {
                setTitle(newContent.title);
            } 
        }, id);

        webSocketService.joinPage(id, token);


        webSocketService.subscribeTo(id, setTitle, "title");
        webSocketService.subscribeTo(id, setActiveUsersPic, "users");

    }, [id]);

    useEffect(() => {
        console.log(activeUsersPic);
    }, [activeUsersPic]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            webSocketService.leavePage(id, token);
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        window.addEventListener('popstate', function(event) {
            webSocketService.leavePage(id, token);
        });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handleBeforeUnload);
        };
    }, []);


    const handleContentChange = () => {
        webSocketService.sendContent(id, title);
    };
    
    const sendInvitation = async (e) => {
        e.preventDefault();

        const showNotice = (message, isSuccess) => {
            if(isSuccess){
                shareNoticeMessageRef.current.classList.remove(`${style.opacityZero}`);
                shareNoticeMessageRef.current.classList.remove(`${style.badMessage}`);
                shareNoticeMessageRef.current.classList.add(`${style.goodMessage}`);
            } else {
                shareNoticeMessageRef.current.classList.remove(`${style.opacityZero}`);
                shareNoticeMessageRef.current.classList.remove(`${style.goodMessage}`);
                shareNoticeMessageRef.current.classList.add(`${style.badMessage}`);
            }
            shareNoticeMessageRef.current.textContent = message;
        }

        let username = shareUsername.trim();
        if(shareTeam.some(e => e.username.toUpperCase() === username.toUpperCase())) {
            showNotice("이미 초대된 유저입니다", false);
            return;
        } 

        const response = await axios.post(`${backUrl}/user/check-username`, { username });
        if (response.data.exists) {
            axios({
                method: "post",
                url: `${backUrl}/schedule/team/` + id + "/" + username,
            })
            .then(response => {
                const {data, status, statusText} = response;
                getTeam();
                showNotice("초대를 전송했습니다", true);
            });
        } else {
            showNotice("존재하지 않는 유저입니다", false);
        }
    }



    return (
        <div id={style.contentBody}>
            <div id={style.headerPart}>
                <div id={style.backButton} onClick={()=>{
                        webSocketService.leavePage(id, token);
                        navigate('/schedule')
                    }}/>
                <div ref={titleRef} id={style.headerTitle} onClick={(e) => {
                        titleRef.current.classList.add(`${style.hidden}`);
                        titleInputRef.current.classList.remove(`${style.hidden}`);
                        titleInputRef.current.focus();
                    }}>{title}</div>
                <Input className={style.hidden} ref={titleInputRef} id={style.titleInput} name='title' onChange={changeValue} 
                    value={title || ""} onBlur={handleInput} onKeyDown={(e) => {e.key === 'Enter' && handleInput()}} />
                <div ref={titleWarningRef} id={style.titleWarning} className={style.hidden}>30자 이내로 작성해주세요.</div>
                <div id={style.headerImages}>
                    {activeUsersPic.map((pic, index) => 
                    <div className={style.onlinePics} key={index}
                        style={{
                            backgroundImage: `url(${pic})`,
                        }}>
                    </div>)}
                </div>
                <div id={style.headerShare} onClick={() => {sharePopoverRef.current.classList.remove(`${style.opacityZero}`)}}>공유</div>
                <div id={style.popoverShare} ref={sharePopoverRef} className={style.opacityZero} >
                    <Input id={style.usernameInput} name='shareusername' placeholder='유저의 아이디를 입력하세요' onChange={changeValue} value={shareUsername}></Input>
                    <div id={style.sharefooter}>
                        <div id={style.shareMessage} className={style.opacityZero} ref={shareNoticeMessageRef}>존재하지 않는 유저입니다</div>
                        <div id={style.shareButton} onClick={sendInvitation}>초대</div>
                    </div>
                </div>
            </div>
            <ScheduleEditPart ScheduleId={id} activeUsersPic={activeUsersPic}/>
        </div>
    );
};

export default ScheduleEdit;