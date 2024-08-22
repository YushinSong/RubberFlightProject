import React, { useEffect, useState } from 'react';
import style from '../CSS/ScheduleEdit.module.css';
import webSocketService from '../pages/WebSocketService';
import DateItem from './DateItem';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import Chat from '../../chat/pages/Chat';


const ScheduleEditPart = (props) => {
    const [pairDates, setPairDates] = useState({});
    const [dates, setDates] = useState([]);
    const [version, setVersion] = useState(0);
    const [addDate, setAddDate] = useState(new Date());
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');
    const backUrl = process.env.REACT_APP_BACK_URL;
    
    useEffect(() => {
        let isSubScribed = false;
        fetch(`${backUrl}/dates/${props.ScheduleId}`)
            .then(response => response.json())
            .then(data => {
                setDates([...data.left])
                setVersion(data.right);
            })
            .then(() => {
                if(!isSubScribed){
                    webSocketService.subscribeTo(props.ScheduleId, setPairDates, "dates");
                    isSubScribed = true;
                }
            });

    }, [props.ScheduleId]);
    
    useEffect(() => {
        if(!pairDates.left) 
            return;

        setDates([...pairDates.left]);
        setVersion(pairDates.right);

        // console.log(dates);
        // console.log(version);

    }, [pairDates]);
    
    const changeValue = (index, value, valuetype, version) => {
        let fixedDate = [...dates];

        if(valuetype === 0){
            const kr = new Date(value + (9 * 60 * 60 * 1000));
            fixedDate[index].date = `${kr.getFullYear()}-${(kr.getMonth() + 1).toString().padStart(2, '0')}-${kr.getDate().toString().padStart(2, '0')}`;
        }
        valuetype === 1 && (fixedDate[index].content = value);

        setDates([...fixedDate]);
        handleContentChange(dates, version, -1);
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
        handleContentChange(fixedDate, version + 5, -1);
    }
    const handleDeleteDate = (index) => {
        handleContentChange(dates, version + 5, index);
    }
    
    const handleContentChange = (content, inputversion, deleteIndex) => {
        webSocketService.sendDates(props.ScheduleId, content, inputversion, deleteIndex);
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
                    <Chat />
                </div>
            </div>
            <div id={style.datelistcontainer}>
                {dates.map((date, index) => 
                    <DateItem
                        key={index}
                        index={index}
                        dateInfo={date}
                        version={version}
                        handleChange={changeValue}
                        handleDeleteDate={handleDeleteDate} />
                )}
            </div>
        </div>
    );
};

export default ScheduleEditPart;