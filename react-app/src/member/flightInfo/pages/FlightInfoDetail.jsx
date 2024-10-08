import React, { useContext, useEffect, useState } from 'react';
import { FlightInfoContext } from '../contexts/FlightInfoContext'; 
import { useParams } from 'react-router-dom'; 
import { Box, Flex, Text, Link, Spinner } from '@chakra-ui/react'; 
import FlightInfoItem from '../components/FlightInfoItem';
import FlightDetails from '../components/FlightDetails';
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { getAirportInfo1 } from '../../../apis/airportApis';
import moment from 'moment-timezone';

const FlightInfoDetail = () => {
  const { flightId } = useParams(); 
  const { flightInfo, timetable, history, setFlightId } = useContext(FlightInfoContext); 
  const [arrTimezone, setArrTimezone] = useState('');
  const [depTimezone, setDepTimezone] = useState('');
  const isDebug = process.env.REACT_APP_DEBUC;

  useEffect(() => {
    document.body.style.overflowY = 'scroll';
    setFlightId(flightId); 
  }, [flightId, setFlightId]);

  // flightInfo 업데이트 시 공항 타임존 정보 가져오기
  useEffect(() => {
    if (flightInfo?.arrIata) {
      getAirportInfo1(flightInfo.arrIata)
        .then(response => {
          setArrTimezone(response.data[0].timezone);
          // console.log(response.data[0].timezone); //미국
        })
        .catch(error => {
          console.error('Error fetching arrival airport info:', error);
        });
    }
    if (flightInfo?.depIata) {
      getAirportInfo1(flightInfo.depIata)
        .then(response => {
          setDepTimezone(response.data[0].timezone);
          // console.log(response.data[0].timezone);
        })
        .catch(error => {
          console.error('Error fetching departure airport info:', error);
        });
    }
  }, [flightInfo]);

  const convertToKST = (time, timezone) => {
    return moment.tz(time, timezone).tz('Asia/Seoul').toDate();
  };

  const renderFlightDetails = () => {
    console.log("api상 arr시간",flightInfo.arrSch);
    console.log("api상 dep시간",flightInfo.depSch);

    let arrschTime = flightInfo.arrSch;
    let depschTime = flightInfo.depSch;
    console.log("로컬임?", isDebug);

    if(isDebug === 'false'){
      let dateArrSchTime = new Date(arrschTime);
      let dateDepSchTime = new Date(depschTime);
      console.log("api상 arr시간 Date로", dateArrSchTime);
      console.log("api상 dep시간 Date로", dateDepSchTime);

      dateArrSchTime.setHours(dateArrSchTime.getHours() + 9);
      dateDepSchTime.setHours(dateDepSchTime.getHours() + 9);
      console.log("api상 arr시간 바꿈", dateArrSchTime);
      console.log("api상 dep시간 바꿈", dateDepSchTime);

      let arryear = dateArrSchTime.getFullYear();
      let arrmonth = String(dateArrSchTime.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
      let arrday = String(dateArrSchTime.getDate()).padStart(2, '0');
      let arrhours = String(dateArrSchTime.getHours()).padStart(2, '0');
      let arrminutes = String(dateArrSchTime.getMinutes()).padStart(2, '0');
      let arrseconds = String(dateArrSchTime.getSeconds()).padStart(2, '0');
      
      arrschTime = `${arryear}-${arrmonth}-${arrday} ${arrhours}:${arrminutes}:${arrseconds}`;

      let depyear = dateDepSchTime.getFullYear();
      let depmonth = String(dateDepSchTime.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
      let depday = String(dateDepSchTime.getDate()).padStart(2, '0');
      let dephours = String(dateDepSchTime.getHours()).padStart(2, '0');
      let depminutes = String(dateDepSchTime.getMinutes()).padStart(2, '0');
      let depseconds = String(dateDepSchTime.getSeconds()).padStart(2, '0');
      
      depschTime = `${depyear}-${depmonth}-${depday} ${dephours}:${depminutes}:${depseconds}`;

      console.log("으아악!!!! arr시간 바꿈", arrschTime);
      console.log("으아악!!!! dep시간 바꿈", depschTime);

    }

    const arrTimeInKST = convertToKST(arrschTime, arrTimezone);
    const depTimeInKST = convertToKST(depschTime, depTimezone);
    const currentTimeInKST = new Date(); // 현재 한국 시간
    

    console.log("arr",arrTimeInKST);
    console.log("dep",depTimeInKST);
    console.log("kor",currentTimeInKST);

    return (
      <Box
        style={{
          margin: '0 auto',
          maxWidth: '700px',
          minWidth: '700px',  
          padding: '16px',
          borderWidth: '1px',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
      >
        {/* 비행 세부정보 표시 */}
        <FlightDetails flightInfo={flightInfo} timetable={timetable} history={history} />
        <Box borderBottom="1px" borderColor="gray.300" my={4} />

        {/* 추가 비행 정보 표시 */}
        <FlightInfoItem flightInfo={flightInfo} timetable={timetable} history={history} />

        {/* {timetable.length > 0 && timetable[0]?.flight?.iataNumber && arrTimeInKST >= currentTimeInKST && depTimeInKST < currentTimeInKST && (  */}
        {arrTimeInKST >= currentTimeInKST && ( 
          <Flex justifyContent="flex-end" mt={10} mr={30}>
            <Link 
              href={`/live?flight=${timetable[0]?.flight?.iataNumber}`} 
              color="blue.500"
              display="flex" 
              alignItems="center"
            >
              <Text fontWeight="bold" mr={2}>실시간 비행기 위치 보러가기</Text>
              <IoIosArrowDroprightCircle fontSize="20px" />
            </Link>
          </Flex>
        )}

        {timetable.length > 0 && (
          <Box mt={10} p={10} borderWidth="1px" borderColor="gray.300" borderRadius="md">
            <Text fontSize="2xl">비행기 탑승시 주의사항</Text>
            <Text fontSize="15px" mt={7} color="gray.700">
              1. 탑승 수속을 위해 최소 2시간 전에 공항에 도착하세요.
            </Text>
            <Text fontSize="15px" mt={5} color="gray.700">
              2. 귀중품은 항상 소지하고, 귀중품을 위탁 수하물에 넣지 마세요.
            </Text>
            <Text fontSize="15px" mt={5} color="gray.700">
              3. 안전벨트는 비행기가 이륙할 때와 착륙할 때 반드시 착용하세요.
            </Text>
            <Text fontSize="15px" mt={5} color="gray.700">
              4. 기내에서의 전자기기 사용 규정을 준수하세요.
            </Text>
            <Text fontSize="15px" mt={5} color="gray.700">
              5. 기내에서 음주 및 흡연은 금지되어 있습니다.
            </Text>
            <Text fontSize="15px" mt={5} color="gray.700">
              6. 비상 상황 발생 시 승무원의 지시에 따라 행동하세요.
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box p={4} backgroundColor="linear-gradient(to left, #ffffff 0%, #ffffff00 3%, #ffffff00 97%,#ffffff 100%)" 
      style={{  
        marginTop: '20px',
        overflowY: 'auto', 
        height: '800px',  
        position: 'relative',
      }}
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#6d9eeb', 
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#4b8dc3', 
        },
      }}
    >
      <Flex direction="column" align="flex-start">
        {flightInfo ? renderFlightDetails() : (
          <Flex justify="center" align="center" height="100vh" width="100%">
            <Spinner size="xl" />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default FlightInfoDetail;
