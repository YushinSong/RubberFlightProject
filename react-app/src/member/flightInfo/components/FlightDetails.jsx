import React from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { calculateFlightDuration, convertDelay } from './FlightUtils';
import { IoIosAirplane } from "react-icons/io";
import { MdLocationPin } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const FlightDetails = ({ flightInfo, timetable, history }) => {
  const navigate = useNavigate(); 

  const flightData = timetable.length > 0 ? timetable[0] : history.length > 0 ? history[0] : null;

  const delayInMinutes = flightData?.departure?.delay || 0;
  const { hours: delayHours, minutes: delayMinutes } = convertDelay(delayInMinutes);

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const info = flightInfo || {};
  const depSch = new Date(info.depSch);
  const now = new Date();

  const gap = flightInfo.depIata.length > 5 || flightInfo.depAirport.length > 10 ? 20 : 110;

  return (
    <Flex direction="column" mb={4}>
      <Flex justify="space-between">
        <Flex direction="column" ml={4} mt={5}>
          <Text fontSize="23px" fontFamily="Noto Sans KR" fontWeight="900">항공 정보</Text>
          <Text fontSize="16px" mt={1} ml={1} color="#815151">{flightInfo.airlineName || "-"}</Text>
        </Flex>
        <Button 
          mt={4} 
          onClick={() => navigate(-1)} 
          fontSize="14px"
          padding="2px 12px" 
          bg="#4096FF" 
          color="white" 
          _hover={{ bg: "blue.600" }} 
        >
          뒤로가기
        </Button>
      </Flex>

      <Flex direction="row" mb={4} align="center" gap={7} p={6}>
        {/* 1 */}
        <Flex direction="column" gap={16} align="center">
          <Text fontSize="xl">{formatTime(flightInfo.depSch) || "-"}</Text>
          <Text fontSize="14px" fontWeight="bold" mt={5} mb={5} color="gray.500" whiteSpace="nowrap">
          {calculateFlightDuration(flightInfo.depSch, flightInfo.arrSch)}
          </Text>
          <Text fontSize="xl">{formatTime(flightInfo.arrSch) || "-"}</Text>
        </Flex>

        {/* 2 */}
        <Box align="center" pl={2}>
          <IoIosAirplane fontSize="30px" color="gray" />
          <Box
            width="3px"
            height="170px"
            mt={3}
            mb={3}
            backgroundColor="gray.300"
          />
          <MdLocationPin fontSize="27px" color="gray" />
        </Box>

        {/* 3 */}
        <Box pl={12}>
          <Flex justify="center" direction="row" align="center" gap={gap} mb={8} wrap="nowrap">
            <Text fontSize="2xl" fontWeight="bold">{flightInfo.depIata || "-"}</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.500">{flightInfo.depAirport || "-"}</Text>
            <Text fontSize="14px" color="gray.500" whiteSpace="nowrap">출발</Text>
          </Flex>

          <Box textAlign="center" borderWidth="1px" borderColor="gray.300" borderRadius="md" p={4} mb={2}>
            <Flex justify="space-around" direction="row">
              <Flex justify="space-between" direction="column">
                <Text fontSize="sm" mb={2} color="gray.500">
                  {flightData ? "예정 출발시간" : "실제 출발시간"}
                </Text>
                <Text fontSize="30px" fontWeight="bold">
                  {formatTime(flightData?.departure?.estimatedTime || flightInfo.depSch) || "-"}
                </Text>
              </Flex>
              <Flex justify="space-between" direction="column">
                <Text fontSize="sm" mb={2} color="gray.500">
                  {flightData ? "예정 도착시간" : "실제 도착시간"}
                </Text>
                <Text fontSize="30px" fontWeight="bold">
                  {formatTime(flightData?.arrival?.estimatedTime || flightInfo.arrSch) || "-"}
                </Text>
              </Flex>
            </Flex>
          </Box>

          <Text fontSize="sm" color="red.500" mb={8} align="right">
            {now > depSch && delayInMinutes > 0 && (
            delayHours > 0 
              ? `총 ${delayHours}시간 ${delayMinutes}분 지연되었습니다.` 
              : `총 ${delayMinutes}분 지연되었습니다.`
            )}
          </Text>

          <Flex justify="center" direction="row" align="center" gap={90}>
            <Text fontSize="2xl" fontWeight="bold">{flightInfo.arrIata || "-"}</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.500">{flightInfo.arrAirport || "-"}</Text>
            <Text fontSize="14px" color="gray.500" whiteSpace="nowrap">도착</Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default FlightDetails;
