import React, { useEffect, useRef, useState } from 'react';
import style from '../CSS/ScheduleEdit.module.css';
import TextareaAutosize from 'react-textarea-autosize';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import { FaTrash } from "react-icons/fa6";
import debounce from 'lodash.debounce';

const DateItem = ({ index, dateInfo, version, handleChange, handleDeleteDate }) => {
    const {id, date, content} = dateInfo;
    const [localContent, setLocalContent] = useState('');
    const [localVersion, setLocalVersion] = useState(0);
    const contentRef = useRef(localContent);

    useEffect(() => {
        setLocalContent(content);
    }, []);
    useEffect(() => {
        if(version > localVersion){
            setLocalContent(content);
            setLocalVersion(version);
        }
    
        // console.log("인덱스 " + index);
        // console.log(`서버로부터 받은 메세지 - ${content}`);
        // console.log(`로컬 받은 메세지 - ${localContent}`);
        // console.log("서버 버전 " + version);
        // console.log("로컬 버전 " + localVersion);
    }, [content]);
    useEffect(() => {
        // version === 0 && setLocalContent(content);
        if(version > localVersion){
            setLocalVersion(version);
        }
        // contentRef.current = content;
    }, [version]);

    useEffect(() => {
        contentRef.current = localContent; // Update the ref whenever localContent changes
    }, [localContent]);

    const sendContentDebounced = debounce(() => {
        console.log(`로컬 버전 = ${localVersion} 서버 버전 = ${version} 서버에 보낼 내용 = ${contentRef.current}`);
        handleChange(index, contentRef.current, 1, localVersion);
    }, 500); // 500ms debounce

    const onInputChange = (event) => {
        version === localVersion && setLocalVersion(localVersion + 1);
        setLocalContent(event.target.value);
        sendContentDebounced();
        // console.log(`서버에 보낼 내용 = ${event.target.value}`);
        // handleChange(index, event.target.value, 1, localVersion);
    };
    const onDateChange = (changedDate) => {
        handleChange(index, changedDate, 0, localVersion + 1);
    };
    const onDeleteClick = () => {
        handleDeleteDate(index);
    };

    return (
        <div className={style.dateItem}>
            <div className={style.dateHeader}>
                <Flatpickr
                placeholder='날짜를 선택하세요'
                        options={{ mode: "single" }}
                        value={date}
                        onChange={onDateChange}
                        className={style.dateinput}
                    />
                <div className={style.deleteButton} onClick={onDeleteClick}>
                    <FaTrash fontSize={'22px'}/>
                </div>
            </div>
            <div className={style.dateContent}>
                <TextareaAutosize
                    // minRows={3}
                    value={localContent}
                    onChange={onInputChange}
                    placeholder='일정을 작성해보세요.'
                    spellCheck={false}
                    style={{
                        width: '100%',
                        backgroundColor: '#ffffff00',
                        resize: "none",
                        border: "0px",
                        outline: 'none', // 클릭 시 outline 제거
                    }}
                />
            </div>
        </div>
    );
};

export default DateItem;