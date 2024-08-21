import React, { useEffect, useRef, useState } from 'react';
import '../css/flatpickr.css';
import { searchFlight } from '../../../apis/flightApis';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import { format } from 'date-fns';
import style from '../css/search.module.css'
import { IoAirplane } from "react-icons/io5";
import { useUser } from '../../user/contexts/LoginContextProvider';
import Header from '../../common/Header/Header';
import { Box, Divider, Text } from '@chakra-ui/react';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaInfoCircle } from 'react-icons/fa';
import PageButtons from '../components/PageButtons';
import { Spinner } from '@chakra-ui/react';
import { SiEthiopianairlines } from "react-icons/si";

const Search = () => {
  const [passengers, setPassengers] = useState(1);
  const [results, setResults] = useState({ outboundFlights: [], inboundFlights: [], combinations: [] });
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [isRoundWay, setIsRoundWay] = useState(true);
  const [tripType, setTripType] = useState('round-trip')

  const [dates, setDates] = useState([]);
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

  const departureInputRef = useRef(null);
  const arrivalInputRef = useRef(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const location = useLocation();
  const [isSearchReady, setIsSearchReady] = useState(false);
  const navigate = useNavigate();
  const backUrl = process.env.REACT_APP_BACK_URL;

  // 유효성
  const [errorMessage, setErrorMessage] = useState('');
  const errorRef = useRef(null);
  const [showError, setShowError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 로그인 여부
  const { isLogin, loginCheck } = useUser();

  const handleClick = (flight) => {
    if (!isLogin) {
      window.alert('로그인 후 이용해주세요.');
      navigate('/login');
      return;
    }

    setSelectedFlight(flight);
    const formattedPassengers = `성인 ${adults}명, 소아 ${children}명, 유아 ${infants}명`;
    navigate('/reserve', {
      state: {
        flight,
        passengers: formattedPassengers
      }
    });
  }

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fbff";
    document.body.style.overflowY = 'scroll';
  }, []);

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

  // 검색 시 자동 완성
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

  // // timezone 추가
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

  // useEffect(() => {
  //   handleSearch();
  // }, [tripType, departure, arrival, departureDate, returnDate, passengers, depTimezone, arrTimezone]);

  // TEST
  // useEffect(() => {
  //   console.log("Departure Timezone:", depTimezone); // depTimezone 상태 값 확인
  // }, [depTimezone]);

  // const handleFocus = (inputType) => {
  //   setFocusedInput(inputType);
  //   setSearchTerm('');
  //   setFilteredAirports(airports);
  // };

  const handleClickEdit = (inputType) => {
    // console.log("Clicked Edit:", inputType);
    setActiveField(inputType);
  };

  // 날짜
  // 날짜를 형식화하여 상태를 업데이트
  const handleDateChange = (selectedDates) => {
    setDates(selectedDates);
    if (selectedDates.length === 2) {
      setDepartureDate(format(selectedDates[0], 'yyyy-MM-dd'));
      setReturnDate(format(selectedDates[1], 'yyyy-MM-dd'));
    } else if (selectedDates.length === 1) {
      setDepartureDate(format(selectedDates[0], 'yyyy-MM-dd'));
      setReturnDate('');
    } else {
      setDepartureDate('');
      setReturnDate('');
    }
  };


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
    switch (type) {
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
    switch (type) {
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


  // 메인에서 받은 정보
  useEffect(() => {
    // 전달받은 정보로 상태 설정
    const { state } = location;
    if (state) {
      const { isRoundWay, departure, arrival, departureDate, returnDate, adults, children, infants } = state;

      if (departureDate) {
        const parsedReturnDate = returnDate ? returnDate : null;
        setDates(parsedReturnDate ? [departureDate, parsedReturnDate] : [departureDate]);
      }

      const formattedDepartureDate = format(new Date(departureDate), 'yyyy-MM-dd');
      const formattedReturnDate = returnDate ? format(new Date(returnDate), 'yyyy-MM-dd') : '';

      setTripType(isRoundWay ? "round-trip" : "one-way");
      setDeparture(departure);
      setArrival(arrival);
      setAdults(adults);
      setChildren(children);
      setInfants(infants);
      setDepartureDate(formattedDepartureDate);
      setReturnDate(formattedReturnDate);
      setIsSearchReady(true);
      console.log("날짜포맷", formattedDepartureDate);
      console.log("날짜포맷2", formattedReturnDate);
      console.log(departure);
      console.log(arrival);
    }
  }, [location]);

  useEffect(() => {
    if (isSearchReady && departure && arrival && departureDate) {
      handleSearch();
      setIsSearchReady(false);
    }
  }, [isSearchReady, departure, arrival, departureDate]);

  // 유효성 검사 날짜
  const isDateAfterOneWeek = (date) => {
    const today = new Date();
    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(today.getDate() + 7);

    return date > oneWeekFromToday;
  };

  // 항공권 검색
  const handleSearch = async () => {
    // const formattedDepartureDate = format(new Date(dates[0]), 'yyyy-MM-dd');
    // const formattedReturnDate = dates[1] ? format(new Date(dates[1]), 'yyyy-MM-dd') : '';

    if (!arrival) {
      setErrorMessage('도착지를 입력해 주세요.');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      setErrorMessage('출발일과 귀국일을 선택해 주세요.');
      return;
    }

    if (tripType === 'one-way' && !departureDate) {
      setErrorMessage('출발일을 선택해 주세요.');
      return;
    }

    const departureDateObject = new Date(departureDate);
    if (!isDateAfterOneWeek(departureDateObject)) {
      setErrorMessage('출발일은 오늘부터 일주일 뒤 이후여야 합니다.');
      return;
    }

    console.log("출발일", departureDate);
    console.log("도착일", returnDate);
    console.log("출발지", departure);
    console.log("도착지", arrival);
    setErrorMessage('');
    setResults({ outboundFlights: [], inboundFlights: [], combinations: [] });
    setIsLoading(true); 
    setHasSearched(true);

    try {
      // API 호출
      const combinedResponse = await searchFlight(departure, departureDate, arrival, returnDate, currentPage, itemsPerPage);
      console.log("될까?", combinedResponse.data);
      setResults(prevResults => ({
        ...prevResults,
        combinations: combinedResponse.data.combinations || [],
        outboundFlights: combinedResponse.data.outboundFlights || [],
        inboundFlights: combinedResponse.data.inboundFlights || []
      }));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  //애니메이션
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

  useEffect(() => {
    if (isSearchReady && departure && arrival && departureDate) {
      handleSearch();
      setIsSearchReady(false);
    }
  }, [isSearchReady, departure, arrival, departureDate, currentPage, itemsPerPage, tripType]);


  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === 'round-trip') {
      setDates(dates.length === 1 ? [dates[0], dates[0]] : dates);
      setDepartureDate(dates[0] ? format(dates[0], 'yyyy-MM-dd') : '');
      setReturnDate(dates[1] ? format(dates[1], 'yyyy-MM-dd') : '');
    } else if (type === 'one-way') {
      setDates([dates[0]]);
      setDepartureDate(dates[0] ? format(dates[0], 'yyyy-MM-dd') : '');
      setReturnDate('');
    }
    setResults({ outboundFlights: [], inboundFlights: [], combinations: [] });
  };

  // 비행기 이름 처리
  const getFormattedAirlineName = (airlineName) => {
    const indexOfParenthesis = airlineName.indexOf('(');
    return indexOfParenthesis !== -1 ? airlineName.substring(0, indexOfParenthesis).trim() : airlineName;
  };

  const paginatedResults = tripType === "round-trip"
    ? results.combinations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : results.outboundFlights.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner size="xl" />
    </div>
  );

  return (
    <Box p={5} pt={0} margin="0 auto" mb={40}>
      <Header isMain={false} />

      <div className={style.searchHeaderContainer}>
        <div id={style.searchplane}/>
        <div id={style.searchCloud}/>
        <div className={style.searchMessage}>
          설레는 여행의 시작, 항공권을 찾아보세요.
        </div>
      </div>


      <div className={style.searchBar}>
        <div className={style.contentpart}>
          <div className={style.wayBox}>
            <button onClick={() => handleTripTypeChange('round-trip')} className={`${style.wButton} ${tripType === 'round-trip' ? style.searchActives : ''}`}>왕복</button>
            <button onClick={() => handleTripTypeChange('one-way')} className={`${style.wButton} ${tripType === 'one-way' ? style.searchActives : ''}`}>편도</button>
          </div>

          <div className={style.selectBox}>
            <div id={style.searchAirport} ref={searchRef}>

              <div id={style.searchDepPart}>
                <div className={style.departureLabel}>출발</div>
                <div
                  className="editable-div" id={style.editableDiv}
                  onClick={() => handleClickEdit('departure')}
                >
                   <div
                    className={`airportName ${departure ? style.airportName : style.placeholderText}`}
                    id={style.airportName}
                  >{departure || '도시, 공항명 입력'}</div>
                  <div className={style.selectArrow} />
                </div>
                {activeField === 'departure' && (
                  <div className={style.searchAirportContainer}>
                    <div className={style.depLabel}>출발 도시/공항</div>
                    <div className={style.searchContainer} ref={departureInputRef}>
                      <AiOutlineSearch style={{ marginRight: '10px', fontSize: '20px', color: '#718096' }} />
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
                                <FaMapMarkerAlt style={{ marginRight: '10px', color: '#4682B4' }} />
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

              <div id={style.searchArrPart}>
                <div className={style.departureLabel}>도착</div>
                <div
                  className="editable-div" id={style.editableDiv}
                  onClick={() => handleClickEdit('arrival')}
                >
                  <div
                    className={`airportName ${arrival ? style.airportName : style.placeholderText}`}
                    id={style.airportName}
                  >
                    {arrival || '도시, 공항명 입력'}
                  </div>
                  <div className={style.selectArrow} />
                </div>
                {activeField === 'arrival' && (
                  <div className={style.searchAirportContainer} >
                    <div className={style.depLabel}>도착 도시/공항</div>
                    <div className={style.searchContainer} ref={arrivalInputRef}>
                      <AiOutlineSearch style={{ marginRight: '10px', fontSize: '20px', color: '#718096' }} />
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
                                <FaMapMarkerAlt style={{ marginRight: '10px', color: '#4682B4' }} />
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

            <div className={style.DatePart}>
              <div className={style.departureLabel}>
                {tripType === 'round-trip' ? '출발일 - 도착일' : '출발일'}
              </div>
              {tripType === 'round-trip' && (
                <div className={style.datePickerContainer}>
                  <Flatpickr
                    placeholder='날짜를 선택하세요'
                    options={{
                      mode: "range",
                    }}
                    value={dates}
                    onChange={handleDateChange}
                    className={style.searchFlatpickrInput}
                  />
                </div>
              )}
              {tripType === 'one-way' && (
                <div className={style.datePickerContainer}>
                  <Flatpickr
                    placeholder='날짜를 선택하세요'
                    options={{ mode: "single" }}
                    value={dates}
                    onChange={handleDateChange}
                    className={style.searchFlatpickrInput}
                  />
                </div>
              )}
            </div>

            <div className={style.peoplePart} ref={menuRef}>
              <div className={style.departureLabel}>인원</div>
              <button
                className={style.dropdownButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                value={passengers}
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
            <div className={style.submit}>
              <button className={style.subButton} onClick={handleSearch}>검색하기</button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {errorMessage && (
        <div className={style.errorMessage} ref={errorRef}>
          {errorMessage}
        </div>
      )}

        {!isLoading && hasSearched && (tripType === 'round-trip' ? results.combinations : results.outboundFlights).length === 0 && (
          <div className={style.noResultsMessage}>
            해당 공항편이 없습니다.
          </div>
        )}

      <div className={style.results}>
        {tripType == "round-trip" && paginatedResults.length > 0 && (
          <div className={style.resultsContents}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FaInfoCircle
                style={{ marginRight: '8px', color: 'gray', fontSize: '15px' }}
              />
              <Text sx={{ color: '#878787', fontFamily: 'Noto Sans KR !important', fontSize: '15px' }}>
                클릭 시 결제 페이지로 넘어갑니다.
              </Text>
            </div>
            <ul>
              {paginatedResults.map((combination, index) => (
                <li key={index} onClick={() => handleClick(combination)}>
                  <div className={style.flights}>
                    <div className={style.flightInfo}>
                      <div className={style.flightAirline}>
                      {getFormattedAirlineName(combination.outbound.airlineName) === getFormattedAirlineName(combination.inbound.airlineName)
                          ? (
                            <>
                            <div className={style.airlineLable1}>항공사
                              <SiEthiopianairlines className={style.airlineIcon} />
                            </div>
                            <div className={style.airlineItem}>
                              {getFormattedAirlineName(combination.outbound.airlineName)}
                            </div>
                            </>
                          )
                          : (
                            <>
                              <div className={style.airlineLable2}>항공사
                                <SiEthiopianairlines className={style.airlineIcon} />
                              </div>
                              <div className={style.airlineItem}>
                                {getFormattedAirlineName(combination.outbound.airlineName)}
                              </div>
                              <div className={style.airlineItemNoMargin}>
                                {getFormattedAirlineName(combination.inbound.airlineName)}
                              </div>
                            </>
                          )}
                      </div>
                      
                      <div className={style.flightTimesContainer}>
                          <div className={style.airlineLable}>시간 </div>
                          <div className={style.flightTimes}>
                            <div className={style.flightDepTime}>
                              {combination.outbound.depTime}
                              <div className={style.depAirport}>{combination.outbound.depAirport}</div>
                            </div>
                            <div className={style.airplane}><IoAirplane /></div>
                            <div className={style.flightArrTime}>
                              {combination.outbound.arrTime}
                              <div className={style.arrAirport}>{combination.outbound.arrAirport}</div>
                            </div>
                          </div>
                          <div className={style.flightTimes2}>
                            <div className={style.flightDepTime}>
                              {combination.inbound.depTime}
                              <div className={style.depAirport}>{combination.inbound.depAirport}</div>
                            </div>
                            <div className={style.airplane1}><IoAirplane /></div>
                            <div className={style.flightArrTime}>
                              {combination.inbound.arrTime}
                              <div className={style.arrAirport}>{combination.inbound.arrAirport}</div>
                            </div>
                          </div>
                        </div>
                          <div className={style.flightTakeTimes}>
                            <div className={style.flightTakeTime}>{combination.outbound.takeTimeFormat}</div>
                            <div className={style.flightTakeTime}>{combination.inbound.takeTimeFormat}</div>
                          </div>
                      </div>

                      <div className={style.flightPrice}>
                        <div className={style.verticalLine}></div>
                        <div className={style.totalPrice}>
                          왕복 {(combination.outbound.price + combination.inbound.price).toLocaleString('ko-KR')}원
                        </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <PageButtons
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              results={results}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {tripType === 'one-way' && paginatedResults.length > 0 && (
          <div className={style.resultsContents}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FaInfoCircle style={{ marginRight: '8px', color: 'gray', fontSize: '15px' }} />
              <Text sx={{ color: '#878787', fontFamily: 'Noto Sans KR !important', fontSize: '15px' }}>
                클릭 시 결제 페이지로 넘어갑니다.
              </Text>
            </div>
            <ul>
              {paginatedResults.map((flight, index) => (
                <li key={index} onClick={() => handleClick(flight)}>
                  <div className={style.flightInfo}>
                    <div className={style.flightInfo}>
                      <div className={style.flightAirline}>
                        <div>{flight.airlineName}</div>
                      </div>
                      <div className={style.flightTimes}>
                        <div className={style.flightDepTime}>
                          {flight.depTime}
                          <div className={style.depAirport}>{flight.depAirport}</div>
                        </div>
                      </div>
                            <div className={style.airplane2}><IoAirplane /></div>
                      <div className={style.flightTimes2}>
                        <div className={style.flightArrTime}>
                          {flight.arrTime}
                          <div className={style.arrAirport}>{flight.arrAirport}</div>
                        </div>
                      </div>
                      
                      <div className={style.flightTakeTimes}>
                        <div className={style.flightTakeTime}>{flight.takeTimeFormat}</div>
                      </div>
                    </div>
                    <div className={style.flightPrice}>
                      <div className={style.verticalLine}></div>
                      <div className={style.totalPrice}>
                        {(flight.priceFormat).toLocaleString('ko-KR')}원
                      </div>
                    </div>
                    {/* <div className={style.flightAirline}>{flight.airlineName}</div>
                    <div className={style.flightDepTime}>{flight.depTime}<div className={style.depAirport}>{flight.depAirport}</div></div>
                    <div className={style.flightArrTime}>{flight.arrTime}<div className={style.arrAirport}>{flight.arrAirport}</div></div>
                    <div className={style.flightTakeTime}>{flight.takeTimeFormat}</div>
                    <div className={style.verticalLine}></div>
                    <div className={style.flightPrice}>{flight.priceFormat}원</div> */}
                  </div>
                </li>
              ))}
            </ul>
            <PageButtons
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              results={results}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </Box>
  );
};

export default Search;
