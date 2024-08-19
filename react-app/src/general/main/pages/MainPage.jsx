import React, { useEffect, useRef, useState } from 'react';
// import {DatePicker, DateRangePicker} from "@nextui-org/react";
import { Box, Input } from '@chakra-ui/react';
import Header from '../../common/Header/Header.jsx';
import ThreeScene from '../component/ThreeScene.jsx';
import '../../../Global/font.css'
// import '../CSS/Main.css';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import axios from 'axios';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { color } from 'framer-motion';
import style from '../CSS/Main.module.css'
import '../../reserve/css/flatpickr.css'
 
const MainPage = () => {
    const [isAirplaneLoaded, setIsAirplaneLoaded] = useState(false);
    const [isSearhMode, setIsSearhMode] = useState(false);
    const [isRoundWay, setIsRoundWay] = useState(true);

    const [dates, setDates] = useState([null, null]);
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [airports, setAirports] = useState([]);
    const [filteredAirports, setFilteredAirports] = useState([]);
    const [departureSearchTerm, setDepartureSearchTerm] = useState('');
    const [arrivalSearchTerm, setArrivalSearchTerm] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const navigate = useNavigate();

    const reserveButtonRef = useRef(null);
    const searchBoxRef = useRef(null);
    const departureInputRef = useRef(null);
    const arrivalInputRef = useRef(null);
    
    const backUrl = process.env.REACT_APP_BACK_URL;

    // 유효성
    const [errorMessage, setErrorMessage] = useState('');
    const errorRef = useRef(null);
    const [showError, setShowError] = useState(false);

    // useEffect(() => {
    //     document.body.style.overflow = 'hidden';
    // }, []);
    // useEffect(() => {
    //     isAirplaneLoaded && document.querySelector(`#${style.reserveButton}`).classList.add(style.showReserveClass);
    //     isSearhMode && document.querySelector(`#${style.reserveButton}`).classList.remove(style.showReserveClass);
    //     isSearhMode && document.querySelector(`#${style.searchBox}`).classList.add(style.showSeachClass);
    // }, [isAirplaneLoaded, isSearhMode]);

    
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
        document.body.style.overflow = 'hidden';
    }, []);
    useEffect(() => {
        // isAirplaneLoaded && reserveButtonRef.current.classList.add(style.showReserveClass);
        // isSearhMode && reserveButtonRef.current.classList.remove(style.showReserveClass);
        // isSearhMode && searchBoxRef.current.classList.add(style.showSeachClass);

        // console.log('reserveButtonRef.current:', reserveButtonRef.current);
        // console.log('searchBoxRef.current:', searchBoxRef.current);

        if (reserveButtonRef.current) {
            isAirplaneLoaded && reserveButtonRef.current.classList.add(style.showReserveClass);
            isSearhMode && reserveButtonRef.current.classList.remove(style.showReserveClass);
        }
        if (searchBoxRef.current) {
            isSearhMode && searchBoxRef.current.classList.add(style.showSeachClass);
        }
    }, [isAirplaneLoaded, isSearhMode]);

    // 공항 찾기
    useEffect(() => {
        // 공항 데이터를 서버에서 가져오는 useEffect
        axios.get(`${backUrl}/airport/list`)
          .then(response => {
            setAirports(response.data);
            setFilteredAirports(response.data);
          })
          .catch(error => {
            console.error("Error fetching airports:", error);
          });
      }, []);

// 공항 검색
useEffect(() => {
    const handleClickOutside = (event) => {
        if (
            (activeField === 'departure' && departureInputRef.current && departureInputRef.current.contains(event.target)) ||
            (activeField === 'arrival' && arrivalInputRef.current && arrivalInputRef.current.contains(event.target)) ||
            (menuRef.current && menuRef.current.contains(event.target)) ||
            (searchRef.current && searchRef.current.contains(event.target))
        ) {
            return; // 클릭이 `input` 내부에서 발생한 경우, 아무 작업도 하지 않음
        }
        setActiveField(null);
        setIsMenuOpen(false);
        setIsSearchOpen(false);
    };

    if (activeField) {
        document.addEventListener('click', handleClickOutside);
    }

    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
}, [activeField, departureInputRef, arrivalInputRef, menuRef, searchRef]);

    // 테스트용
    // useEffect(() => {
    //     requestAnimationFrame(() => {
    //         console.log("Departure Input Ref after render:", departureInputRef.current);
    //         console.log("Arrival Input Ref after render:", arrivalInputRef.current);
    //     });
    // }, [activeField]);

    const handleSearchTermChange = (e, type) => {
        e.stopPropagation(); // 클릭 이벤트 전파 방지
        const term = e.target.value || '';
        if (type === 'departure') {
            setDepartureSearchTerm(term);
        } else if (type === 'arrival') {
            setArrivalSearchTerm(term);
        }
        setFilteredAirports(
            airports.filter(airport =>
                (airport.airportName?.toLowerCase() || '').includes(term.toLowerCase()) ||
                (airport.airportIso?.toLowerCase() || '').includes(term.toLowerCase())
            )
        );
    };

// 테스트용
    // useEffect(() => {
    //     console.log("Active Field:", activeField);
    // }, [activeField]);

    const handleSelectAirport = (airportCode) => {
        if (activeField === 'departure') {
            setDeparture(airportCode);
            setDepartureSearchTerm('');
        } else if (activeField === 'arrival') {
            setArrival(airportCode);
            setArrivalSearchTerm('');
        }
        setFilteredAirports(airports);
        setActiveField(null);
    };

    
    const handleClickEdit = (inputType) => {
        // console.log("Clicked Edit:", inputType);
        setActiveField(inputType);
    };
    
    // 테스트
    // useEffect(() => {
    //     console.log("Active Field:", activeField);
    // }, [activeField]);

  // 날짜
  const handleWayChange = (isRound) => {
    setIsRoundWay(isRound);
    if (!isRound) {
      // 편도로 변경 시 첫 번째 날짜만 유지
      setDates([dates[0]], null);
      setDepartureDate(dates[0] ? format(dates[0], 'yyyy-MM-dd') : '');
      setReturnDate('');
    } else {
      // 왕복으로 변경 시 날짜를 다시 설정
      setDates(dates.length === 1 ? [dates[0], dates[0]] : dates);
      setDepartureDate(dates[0] ? format(dates[0], 'yyyy-MM-dd') : '');
      setReturnDate(dates[1] ? format(dates[1], 'yyyy-MM-dd') : '');
    }
  };

    // 날짜 선택 핸들러
      const handleDateChange = (selectedDates) => {
        setDates(selectedDates);
        if (selectedDates.length === 2) {
            console.log(selectedDates);
        } else {
            console.log(selectedDates);
        }
    };

    // 인원 메뉴
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleIncrement = (type) => {
        switch(type) {
            case 'adults':
                setAdults(adults + 1);
                break;
            case 'children':
                setChildren(children + 1);
                break;
            case 'infants':
                setInfants(infants + 1);
                break;
            default:
                break;
        }
    };

    const handleDecrement = (type) => {
        switch(type) {
            case 'adults':
                if (adults > 1) setAdults(adults - 1);
                break;
            case 'children':
                if (children > 0) setChildren(children - 1);
                break;
            case 'infants':
                if (infants > 0) setInfants(infants - 1);
                break;
            default:
                break;
        }
    };

    const handleSubmit = () =>{
        const today = new Date();
        const oneWeekFromToday = new Date(today);
        oneWeekFromToday.setDate(today.getDate() + 7);

        // 유효성 검사
        if(!arrival) {
            setErrorMessage('도착지를 입력해 주세요.');
            return;
        }

        const departureDate = new Date(dates[0]);
        if (departureDate <= oneWeekFromToday) {
            setErrorMessage('출발일은 오늘부터 일주일 뒤 이후여야 합니다.');
            return;
        }

        if (isRoundWay && !dates[1]) {
            setErrorMessage('출발일과 귀국일을 선택해 주세요.');
            return;
        }

        if (errorMessage) {
            setErrorMessage('');
        }
    
        navigate('/search', { state: { 
            isRoundWay: isRoundWay ? true : false,
            departure,
            arrival,
            departureDate: dates[0],
            returnDate: isRoundWay ? dates[1] : '',
            adults,
            children,
            infants
        } });
    }


    useEffect(() => {
        if (errorMessage) {
            setShowError(true);

            // 애니메이션을 트리거하기 위해 상태를 잠시 변경한 후 복원
            const timer = setTimeout(() => {
                setShowError(false);
                // 이후에 errorMessage를 비워서 다시 설정할 수 있습니다
                setErrorMessage('');
            }, 2000); // 애니메이션 시간과 동일하게 설정

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <>
        <Header isMain={true}/>
        <div className={style.contentpart}>
            <ThreeScene setIsAirplaneLoaded={setIsAirplaneLoaded} isSearhMode={isSearhMode}/>
            <Box ref={reserveButtonRef} id={style.reserveButton} onClick={() => setIsSearhMode(true)} className="reserveButton">항공권 조회하기</Box>
            <Box ref={searchBoxRef} id={style.searchBox} className="seachBox">
                <div id={style.wayBox}>
                    <div id={style.roundway} onClick={() => handleWayChange(true)} className={isRoundWay ? style.actives : ''}>왕복</div> 
                    <div id={style.oneway} onClick={() => handleWayChange(false)} className={isRoundWay ? '' : style.actives}>편도</div>
                </div>
                <div id={style.selectBox}>
                <div id={style.airportPart} ref={searchRef}>
                <div id={style.depPart}>
                    <div
                        className="editable-div" id={style.editableDiv}
                        onClick={() => handleClickEdit('departure')}
                    >
                        <div className="airportName" id={style.airportName}>{departure || '출발'}</div>
                        <div className={style.selectArrow} />
                    </div>
                    {activeField === 'departure' && (
                        <div className={style.searchAirportContainer}>
                             <div className={style.searchContainer} ref={departureInputRef}>
                                <input
                                    className={style.searchAirport}
                                    type="text"
                                    value={departureSearchTerm}
                                    onChange={(e) => handleSearchTermChange(e, 'departure')}
                                    placeholder="국가, 공항명 검색"
                                />
                                {departureSearchTerm && (
                                    <div className={style.autocompleteResults}>
                                        {filteredAirports.length > 0 ? (
                                            filteredAirports.map((airport) => (
                                                <div
                                                    key={airport.airportIso}
                                                    onClick={() => handleSelectAirport(airport.airportIso)}
                                                >
                                                    {airport.airportName} ({airport.airportIso})
                                                </div>
                                            ))
                                        ) : (
                                            <div>No results found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div id={style.arrPart}>
                <div
                    className="editable-div" id={style.editableDiv}
                    onClick={() => handleClickEdit('arrival')}
                >
                    <div className="airportName" id={style.airportName}>{arrival || '도착'}</div>
                    <div className={style.selectArrow} />
                </div>
                {activeField === 'arrival' && (
                    <div className={style.searchAirportContainer} >
                         <div className={style.searchContainer} ref={arrivalInputRef}>
                            <input
                                className={style.searchAirport}
                                type="text"
                                value={arrivalSearchTerm}
                                onChange={(e) => handleSearchTermChange(e, 'arrival')}
                                placeholder="국가, 공항명 검색"
                            />
                            {arrivalSearchTerm && (
                                <div className={style.autocompleteResults}>
                                    {filteredAirports.length > 0 ? (
                                        filteredAirports.map((airport) => (
                                            <div
                                                key={airport.airportIso}
                                                onClick={() => handleSelectAirport(airport.airportIso)}
                                            >
                                                {airport.airportName} ({airport.airportIso})
                                            </div>
                                        ))
                                    ) : (
                                        <div>No results found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
                </div>

                    <div className={style.datePart}>
                        {isRoundWay ?
                            (
                                <div className={style.datePickerContainer}>
                                    <Flatpickr
                                    placeholder='날짜를 선택하세요'
                                    options={{ 
                                        mode: "range",
                                    }}
                                    value={dates}
                                    onChange={handleDateChange}
                                    className={style.flatInput}
                                    style={{ pointerEvents: isSearhMode ? 'auto' : 'none' }}
                                    />
                                </div>
                            )
                            :
                            (
                                <div className={style.datePickerContainer}>
                                <Flatpickr
                                 placeholder='날짜를 선택하세요'
                                        options={{ mode: "single" }}
                                        value={dates}
                                        onChange={handleDateChange}
                                        className={style.flatInput}
                                        style={{ pointerEvents: isSearhMode ? 'auto' : 'none' }}
                                    />
                                </div>
                            )
                        }
                    </div>
                    
                    <div className={style.peoplePart} ref={menuRef}>
                        <button 
                            className={style.dropdownButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {`성인 ${adults}, 소아 ${children}, 유아 ${infants}`}
                        </button>
                        {isMenuOpen && (
                            <div className={style.cntContainer}>
                            <div className={style.cntContainerItem}>
                                <button onClick={() => handleDecrement('adults')}>-</button>
                                <label>성인 </label>
                                <span>{adults}명</span>
                                <button onClick={() => handleIncrement('adults')}>+</button>
                            </div>
                            <div className={style.cntContainerItem}>
                                <button onClick={() => handleDecrement('children')}>-</button>
                                <label>소아 </label>
                                <span>{children}명</span>
                                <button onClick={() => handleIncrement('children')}>+</button>
                            </div>
                            <div className={style.cntContainerItem}>
                                <button onClick={() => handleDecrement('infants')}>-</button>
                                <label>유아 </label>
                                <span>{infants}명</span>
                                <button onClick={() => handleIncrement('infants')}>+</button>
                            </div>
                        </div>
                        )}
                    </div>
                    <div id={style.submitButton} onClick={handleSubmit}>검색</div>
                </div>
                {errorMessage && (
                <div className={style.errorMessage} ref={errorRef}>
                    {errorMessage}
                </div>
                )}
            </Box>
        </div>
        </>
    );
};

export default MainPage;
