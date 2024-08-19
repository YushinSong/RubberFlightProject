import React, { useEffect, useState } from 'react';
import style from '../CSS/ScheduleEdit.module.css';
import webSocketService from '../pages/WebSocketService';
import DateItem from './DateItem';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import Chat from '../../chat/pages/Chat';


const ScheduleEditPart = (props) => {
    const [dates, setDates] = useState([]);
    const [addDate, setAddDate] = useState(new Date());
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');
    const backUrl = process.env.REACT_APP_BACK_URL;
    
    useEffect(() => {
        fetch(`${backUrl}/dates/${props.ScheduleId}`)
            .then(response => response.json())
            .then(data => {
                setDates([...data])
            });
            
        webSocketService.subscribeTo(props.ScheduleId, setDates, "dates");

    }, [props.ScheduleId]);
    
    const changeValue = (index, value, valuetype) => {
        let fixedDate = [...dates];

        if(valuetype === 0){
            const kr = new Date(value + (9 * 60 * 60 * 1000));
            fixedDate[index].date = `${kr.getFullYear()}-${(kr.getMonth() + 1).toString().padStart(2, '0')}-${kr.getDate().toString().padStart(2, '0')}`;
        }
        valuetype === 1 && (fixedDate[index].content = value);

        setDates([...fixedDate]);
        handleContentChange(dates, -1);
    };
    
    const handleAddDate = (e) => {
        const kr = new Date(addDate + (9 * 60 * 60 * 1000));
        const newDate = `${kr.getFullYear()}-${(kr.getMonth() + 1).toString().padStart(2, '0')}-${kr.getDate().toString().padStart(2, '0')}`;
        const newObject = {
            date:newDate,
            content:'',
        }
        
        let fixedDate = [...dates];
        fixedDate.push(newObject);
        handleContentChange(fixedDate, -1);
    }
    const handleDeleteDate = (index) => {
        handleContentChange(dates, index);
    }
    
    const handleContentChange = (content, deleteIndex) => {
        webSocketService.sendDates(props.ScheduleId, content, deleteIndex);
    }

    return (
        <div id={style.editPart}>
            <div id={style.editcontainer}>
                <div id={style.adddatecontainer}>
                    <div id={style.addDate}>
                        <Flatpickr
                        placeholder='날짜를 선택하세요'
                                options={{ mode: "single" }}
                                value={addDate}
                                className={style.adddateinput}
                                onChange={(date)=>setAddDate(date)}
                            />
                    </div>
                    <div id={style.addButton} onClick={handleAddDate}/>
                </div>
                <div id={style.chatcontainer}>
                    <Chat activeUsersPic={props.activeUsersPic} />
                </div>
            </div>
            <div id={style.datelistcontainer}>
                {dates.map((date, index) => 
                    <DateItem
                        key={index}
                        index={index}
                        dateInfo={date}
                        handleChange={changeValue}
                        handleDeleteDate={handleDeleteDate} />
                )}
            </div>
        </div>
    );
};

export default ScheduleEditPart;