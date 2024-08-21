import React, { useState } from 'react';
import { Box, Flex, Heading, Text, Image, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateFlightDuration, getStatusText } from './FlightUtils';
import img1 from '../../../assets/images/flightInfo/img1.webp';

const MotionBox = motion(Box);
const MotionButton = motion(Button); 

const FlightInfoCard = ({ flight, index, tabKey, isPast, review }) => {
  const navigate = useNavigate(); 
  const status = getStatusText(flight);
  const [isHovered, setIsHovered] = useState(false); 

  return (
    <MotionBox
      key={flight.id + tabKey}
      mb={10}
      onClick={() => navigate(`/mypage/flight-info/${flight.id}`)} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      initial={{ opacity: 0, x: -50, scale: 1 }}
      animate={{ opacity: 1, x: 0, scale: 1, paddingBottom: isPast && isHovered ? '80px' : '20px', }}
      whileHover={{ scale: 1.02 }}
      exit={{ opacity: 0, x: 50 }} 
      transition={{
        default: { duration: 0.5, delay: index * 0.1 },
        scale: { duration: 0.2 },
        paddingBottom: { duration: 0.1 },
      }}
      position="relative"
      style={{
        maxWidth: '700px',
        minWidth: '700px',
        margin: 'auto',
        width: '90%',
        borderWidth: '1px',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px',
        marginBottom: '60px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s ease'
      }}
    >
      {/* 항공편 출발지 및 도착지 정보 */}
      <Flex justify="space-between" align="center" ml="-15px" mt="-16px" mr="-15px" pb={2} pt={2} pl={7} pr={2} borderBottom="3px solid #6d9eeb" borderTopRadius="8px" >
        <Heading as="h2" size="20px" m={2} fontFamily="KIMM_Bold">
          {flight.depAirport} ({flight.depIata}) → {flight.arrAirport} ({flight.arrIata})
        </Heading>
        <Text fontSize="md" color="#c17777" fontWeight="bold" mr={7} textAlign="right" whiteSpace="nowrap">{flight.airlineName}</Text>
      </Flex>
      
      <Flex direction="row" justify="center" align="center">
        <Flex direction="row" align="center" mt={5} width="500px">
          {/* 출발지 정보 */}
          <Box flex="1" textAlign="center" mx={2} display="flex" flexDirection="column" alignItems="center">
            <Text style={{ fontSize: '36px', fontWeight: 'bold' }}>{flight.depIata}</Text>
            <Text style={{ fontSize: '13px', marginTop: '12px', color: '#6fa8dc', fontWeight: 'bold' }}>{flight.depAirport}</Text>
            <Text fontSize="sm" mt={3}>출발</Text>
            <Text fontSize="md" fontWeight="bold" mt={3} mb={2}>
              {new Date(flight.depSch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </Box>

          {/* 비행 상태 및 비행 시간 정보 */}
          <Box flex="1" style={{ textAlign: 'center', marginRight: '32px' }} ml={6}>
            <Image src={img1} alt="Departure Icon" width="100%" />
            <Text borderWidth="1px" borderRadius="md" pt={2} pb={1.5} mt={3} borderColor={status.color} color="white" backgroundColor={status.color}>
              {status.text}
            </Text>
            <Text fontSize="14px" mt={3} whiteSpace="nowrap">{calculateFlightDuration(flight.depSch, flight.arrSch)}</Text>
          </Box>

          {/* 도착지 정보 */}
          <Box flex="1" textAlign="center" mx={2} display="flex" flexDirection="column" alignItems="center">
            <Text style={{ fontSize: '36px', fontWeight: 'bold' }}>{flight.arrIata}</Text>
            <Text style={{ fontSize: '13px', marginTop: '12px', color: '#6fa8dc', fontWeight: 'bold' }}>{flight.arrAirport}</Text>
            <Text fontSize="sm" mt={3}>도착</Text>
            <Text fontSize="md" fontWeight="bold" mt={3} mb={2}>
              {new Date(flight.arrSch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </Box>
        </Flex>

        {/* 탑승 정보 */}
        <Box flex="1" mt={4} mr={3} textAlign="center" width="200px">
          <Text fontSize="13px" mt={3} fontFamily="KIMM_Light">탑승일 | DATE</Text>
          <Text fontSize="14px" mt={1} fontFamily="Noto Sans KR !important"  fontWeight="bold" whiteSpace="nowrap">
            {new Date(flight.depSch).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d{1,2})\.$/, '$1')}
          </Text>
          
          <Text fontSize="13px" mt={3} fontFamily="KIMM_Light">인원 | COUNT</Text>  
          <Text fontSize="14px" mt={1} fontFamily="Noto Sans KR !important"  fontWeight="bold" whiteSpace="nowrap">{flight.reserve.personnel}</Text>
          <Text fontSize="13px" mt={3} fontFamily="KIMM_Light">탑승시간 | TIME</Text>
          <Text fontSize="14px" mt={1} fontFamily="Noto Sans KR !important"  fontWeight="bold" whiteSpace="nowrap">
            {new Date(flight.depSch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </Box>
      </Flex>

      {isPast && ( review && flight.id === review.flightInfo.id ? (
          <MotionButton className="review-button" position="absolute" fontSize="14px" backgroundColor="#6d9eeb" color="white"
              bottom="15px" right="20px" size="lg" display={isHovered ? 'block' : 'none'}
              onClick={(e) => { e.stopPropagation(); navigate(`/mypage/review/${review.id}`); }}>
            리뷰 확인
          </MotionButton>
          ) : (
          <MotionButton className="review-button" position="absolute" fontSize="14px" backgroundColor="#6d9eeb" color="white"
              bottom="15px" right="20px" size="lg" display={isHovered ? 'block' : 'none'}
              onClick={(e) => { e.stopPropagation();
              navigate(`/mypage/review-write`, { state: { flight } }); }}>
            리뷰 작성
          </MotionButton>
      ))}
    </MotionBox>
  );
};

export default FlightInfoCard;
