import React, { useEffect, useState } from 'react';
import { Input, Button } from '@chakra-ui/react';
import { getLiveInfo } from '../../../apis/liveInfoApis';
import { getAirportInfo1 } from '../../../apis/airportApis';
import Header from '../../../general/common/Header/Header';
import styles from '../CSS/LiveFlight.module.css';
import { alert } from '../../../apis/alert.js';

const LiveFlight = () => {
  const [flightIataInput, setFlightIataInput] = useState("");
  const [flightData, setFlightData] = useState(null);
  const [depAirportData, setDepAirportData] = useState(null);
  const [arrAirportData, setArrAirportData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.overflowY = 'scroll';
    document.body.style.overflowX = 'hidden';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flightIata = params.get('flight');
    if (flightIata) {
      setFlightIataInput(flightIata);
    }
  },[]);

  const searchFly = async () => {
    setIframeLoading(true);

    try {
      const response = await getLiveInfo(flightIataInput);
      const data = response.data[0];

      if (!data) {
        alert("조회 실패", "실시간 비행 정보가 없거나 잘못된 코드입니다.", "error" )
        setFlightIataInput('');
        setIframeLoading(false);
        return;
      }

      const extractedData = {
        flightIata: data.flight.iataNumber,
        arrIataCode: data.arrival.iataCode,
        depIataCode: data.departure.iataCode,
        latitude: data.geography.latitude,
        longitude: data.geography.longitude,
        direction: data.geography.direction,
        altitude: data.geography.altitude,
        horizontal: data.speed.horizontal,
        airlineIata: data.airline.iataCode,
        status: data.status,
      };

      setFlightData(extractedData);

      const [arrAirportResponse, depAirportResponse] = await Promise.all([
        getAirportInfo1(extractedData.arrIataCode),
        getAirportInfo1(extractedData.depIataCode),
      ]);

      if (arrAirportResponse.data[0]) {
        setArrAirportData({
          name: arrAirportResponse.data[0].nameAirport,
          latitude: arrAirportResponse.data[0].latitudeAirport,
          longitude: arrAirportResponse.data[0].longitudeAirport,
        });
      }

      if (depAirportResponse.data[0]) {
        setDepAirportData({
          name: depAirportResponse.data[0].nameAirport,
          latitude: depAirportResponse.data[0].latitudeAirport,
          longitude: depAirportResponse.data[0].longitudeAirport,
        });
      }

      if (extractedData && arrAirportResponse.data[0] && depAirportResponse.data[0]) {
        const iframe = document.getElementById('map-iframe');

        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'UPDATE_COORDINATES',
            liveLat: extractedData.latitude,
            liveLng: extractedData.longitude,
            arrAirportLat: arrAirportResponse.data[0].latitudeAirport,
            arrAirportLng: arrAirportResponse.data[0].longitudeAirport,
            depAirportLat: depAirportResponse.data[0].latitudeAirport,
            depAirportLng: depAirportResponse.data[0].longitudeAirport,
          }, '*');
        } else {
          console.error('iframe or contentWindow is not available.');
        }
      } else {
        alert("조회실패", "현재 비행 정보가 없는 코드입니다.", "error" );
      }
    } catch (error) {
      console.error("Error fetching flight or airport data:", error);
      alert('Error','존재하지 않습니다','error');
    } finally {
      setIframeLoading(false);
    }
  };

  // 상태에 따른 메시지 변환
  const getStatusMessage = (status) => {
    switch (status) {
      case "":
        return "비행 중";
      case "en-route":
        return "비행 중";
      case "landed":
        return "도착";
      case "unknown":
        return "알수없음";
      default:
        return "상태 정보 없음";
    }
  };

  return (
    <>
      <Header isMain={false} />

      <div className={styles.allCon}>
        <div id={styles.headerairplane}/>
        <div className={styles.livestart1}></div>
        <div className={styles.livestart2}>
          비행기 코드를 통해 위치를 검색해보세요<br />
          친구나 가족들이 타고있는 항공편의 실시간 위치를 알 수 있어요
        </div>

        <div className={styles.searchCon}>
          <Input
            className={styles.flightIata}
            type="text"
            placeholder='비행 코드 입력하기'
            _placeholder={{ opacity: 1, color: 'black.500' }}
            name="flightIata"
            value={flightIataInput}
            onChange={(e) => setFlightIataInput(e.target.value)}
          />
          <Button onClick={searchFly} id={styles.searchBtn}>Search</Button>
        </div>

        <div className={styles.earthCon}>
          {flightData && arrAirportData && depAirportData && (
            <div className={styles.aboutFlight}>
              <span className={styles.pp}>Departure Airport:</span> {depAirportData.name}<br />
              <span className={styles.pp}>Arrival Airport:</span> {arrAirportData.name}<br />
              <span className={styles.pp}>Status:</span> <span id={styles.ppp}>{getStatusMessage(flightData.status)}</span><br />
              <span className={styles.pp}>Speed:</span> {flightData.horizontal} km/h<br />
            </div>
          )}

          {iframeLoading  && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingImg}></div>
            </div>
          )}

          <iframe
            id="map-iframe"
            src={`/GoogleMap.html?apiKey=${apiKey}`}
            width="100%"
            height="100%"
            title="Google Map"
            onLoad={() => setIframeLoading(false)}
          ></iframe>

        </div>
      </div>
    </>
  );
};

export default LiveFlight;

