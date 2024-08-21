import React, { useContext, useState, useEffect } from 'react';
import { Box, Flex, Divider, Avatar, Text, Button, Icon, Circle, Image } from '@chakra-ui/react';
import { LoginContext } from '../../../general/user/contexts/LoginContextProvider';
import { FiPlus } from 'react-icons/fi';
import { IoMdSettings } from 'react-icons/io'; 
import { AiOutlineLogout } from 'react-icons/ai';
import { BsCalendar, BsCheckCircle } from 'react-icons/bs';
import CouponModal from './CouponModal';
import { useNavigate } from 'react-router-dom';
import UserInfoModal from './UserInfoModal';
import Swal from 'sweetalert2';
import { FaPlane, FaCalendarAlt, FaClipboardCheck, FaThumbsUp, FaUser } from "react-icons/fa";
import styles from '../CSS/UserInfoModal.module.css';
import Cookies from 'js-cookie';

const UserInfo = () => {
  const { isLogin, logout } = useContext(LoginContext);
  const { userInfo } = useContext(LoginContext); 
  const [isCouponModalOpen, setCouponModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [reservationCount, setReservationCount] = useState(null);
  const [error, setError] = useState(null);
  const [couponCount, setCouponCount] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);
  const token = Cookies.get('accessToken');
  const backUrl = process.env.REACT_APP_BACK_URL;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tel: '',
    image: null,
    existingImage: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo.id) {
      const fetchUserEmail = async () => {
        try {
          const response = await fetch(`${backUrl}/mypage/${userInfo.id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();  
          setFormData(prevData => ({
            ...prevData,
            name: data.name || '',
            email: data.email || '',
            tel: data.tel || '',
            existingImage: data.image || ''
          }));
        } catch (error) {
          console.error('유저 이메일 정보를 가져오는 데 실패했습니다:', error);
        }
      };

      fetchUserEmail();  
    }
  }, [userInfo.id]);

  const handleOpenCouponModal = () => setCouponModalOpen(true);
  const handleCloseCouponModal = () => {
    setCouponModalOpen(false);
    fetchCouponCount();
  };
  const handleOpenInfoModal = () => setInfoModalOpen(true);
  const handleCloseInfoModal = () => setInfoModalOpen(false);

  const navigateToSchedule = () => navigate('/schedule');
  const navigateToChecklist = () => navigate('/schedule');

  const handleLogout = async () => {
    try {
      await logout(true);

      Swal.fire({
        title: '로그아웃되었습니다.',
        text: '메인화면으로 이동합니다.',
        icon: 'success',
        confirmButtonText: '확인',
        backdrop: true,
        position: 'center',
        customClass: {
          container: 'swal-container'
        },
        didOpen: () => {
          document.querySelector('.swal2-container').style.zIndex = 9999;
        }
      }).then(() => navigate("/"));
    } catch (error) {
      console.error('로그아웃 처리 중 오류 발생:', error);
    }
  };

  // 유저의 예약 횟수
  useEffect(() => {
    const fetchReservationCount = async () => {
      try {
        const response = await fetch(`${backUrl}/reservation/count`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReservationCount(data.count);
      } catch (error) {
        setError('Error fetching reservation count');
        console.error('Error fetching reservation count', error);
      }
    };

    fetchReservationCount();
  });

  // 유저의 쿠폰 개수
  const fetchCouponCount = async () => {
    try {
      const response = await fetch(`${backUrl}/coupon/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCouponCount(data.count);
    } catch (error) {
      setError('Error fetching coupon count');
      console.error('Error fetching coupon count', error);
    }
  };

  useEffect(() => {
    fetchCouponCount();
  }, [])

    // 유저의 리뷰 개수
    useEffect(() => {
      const fetchReviewCount = async () => {
        try {
          const response = await fetch(`${backUrl}/review/count`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setReviewCount(data.count);
        } catch (error) {
          setError('Error fetching reservation count');
          console.error('Error fetching reservation count', error);
        }
      };

      fetchReviewCount();
    });


  return (
    <>
      <div className={styles.infoContainer}>
      <Box className={styles.info}>
        <Flex alignItems="center">
          <Icon as={FaUser} boxSize={8} mr={2} />
          <Text marginLeft="5px">내 정보</Text>
        </Flex>
      </Box>
      </div>

      <Box
        maxWidth="900px"
        width="90%"
        margin="auto"
        marginTop="20px"
        borderRadius="lg"
        boxShadow="md"
        bg="white"
      >
        <Flex p={4} bg="blue.600" color="white" borderTopRadius="lg" align="center" justify="space-between">
          <Flex align="center" ml={3}>
            <Avatar 
              size="lg"
              name={formData.name || '이름 없음'} 
              src={formData.existingImage || '/default-avatar.png'}
            />
            <Box ml={4} display="flex" flexDirection="column" alignItems="flex-start">
              <Flex alignItems="center">
                <Text fontSize="xl" fontWeight="bold">{formData.name || '이름 없음'}</Text>
                <Icon as={IoMdSettings} boxSize={6} ml={2} cursor="pointer" onClick={handleOpenInfoModal}/> 
              </Flex>
              <Text fontSize="sm" mt={1}>{formData.email || '이메일 없음'}</Text>
            </Box>
          </Flex>

          <Button
            variant="ghost"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius="full"
            color="white"
            _hover={{ bg: "blue.700" }}
          >
            <Icon as={AiOutlineLogout} boxSize={6} onClick={handleLogout}  />
          </Button>
        </Flex>
        <br />
        <Box p={4}>
          <Flex borderRadius="lg" bg="white" p={4} boxShadow="sm" mb={4}>
            <Box flex="1" p={4}>
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold">이용내역</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {reservationCount !== null ? `${reservationCount}회` : '0회'}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4}>
                <Text fontSize="lg" fontWeight="bold">나의 리뷰</Text>
                <Text fontSize="lg" fontWeight="bold">
                {reviewCount !== null ? `${reviewCount}개` : '0개'}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4}>
                <Text fontSize="lg" fontWeight="bold">사용 가능 쿠폰</Text>
                <Flex align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    {couponCount !== null ? `${couponCount}장` : '0장'}
                  </Text>
                  <Icon as={FiPlus} boxSize={5} ml={2} cursor="pointer" onClick={handleOpenCouponModal} />
                </Flex>
              </Flex>
            </Box>

            <Divider orientation="vertical" height="140px" ml={4} mr={4} color="gray.200"/>

            <Box flex="1" p={4}>
              <Text fontSize="lg" fontWeight="bold" mb={5}>나의 서비스 {">>"}</Text>
              <Flex mt={2} direction="row" align="center" justify="center" gap={14}>
                <Flex direction="column" align="center" cursor="pointer" onClick={navigateToSchedule}>
                  <Icon as={BsCalendar} boxSize="50px" mb={3} color="blue.600" />
                  <Text fontSize="sm" color="blue.600"  marginLeft="13px">일정 {">>"}</Text>
                </Flex>
                <Flex direction="column" align="center" cursor="pointer" onClick={navigateToChecklist}>
                  <Icon as={BsCheckCircle} boxSize="50px" mb={3} color="blue.600" />
                  <Text fontSize="sm" color="blue.600" marginLeft="10px">체크리스트 {">>"}</Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Box>
        <Box p={8} bg="gray.70" borderRadius="md">
          <Flex justify="center" align="center">
            <Text fontSize="lg" fontWeight="bold">가이드라인</Text>
            <Box className={styles.nextIcon} ml={2} border={'none'}/>
          </Flex>
          <Text mt={1} textAlign="center">러버 에어 적극적으로 활용하기</Text>

          <Flex
          mt={8}
          align="center"
          justify="center"
          position="relative"
          gap={6}
          px={10} 
        >
          <Divider
            orientation="horizontal"
            borderColor="gray.300"
            position="absolute"
            top="38%"
            left="8%"
            right="0"
            width="85%" 
          />

          <Flex
            direction="column"
            align="center"
            position="relative"
            zIndex={1}
            onClick={() => navigate("/search")}
            cursor="pointer"
            ml={4} 
            mr={4} 
          >
            <Circle size="80px" bg="gray.200" boxShadow="sm">
              <Icon as={FaPlane} boxSize={8} color="blue.600" />
            </Circle>
            <Text mt={2} fontSize="sm" color="blue.600">예약하기</Text>
          </Flex>

          <Flex
            direction="column"
            align="center"
            position="relative"
            zIndex={1}
            onClick={() => navigate("/schedule")}
            cursor="pointer"
            ml={4}
            mr={4}
          >
            <Circle size="80px" bg="gray.200" boxShadow="sm">
              <Icon as={FaCalendarAlt} boxSize={8} color="blue.600" />
            </Circle>
            <Text mt={2} fontSize="sm" color="blue.600">일정작성</Text>
          </Flex>

          <Flex
            direction="column"
            align="center"
            position="relative"
            zIndex={1}
            onClick={() => navigate("/schedule")}
            cursor="pointer"
            ml={4}
            mr={4}
          >
            <Circle size="80px" bg="gray.200" boxShadow="sm">
              <Icon as={FaClipboardCheck} boxSize={8} color="blue.600" />
            </Circle>
            <Text mt={2} fontSize="sm" color="blue.600">체크리스트 작성</Text>
          </Flex>

          <Flex
            direction="column"
            align="center"
            position="relative"
            zIndex={1}
            onClick={() => navigate("/review")}
            cursor="pointer"
            ml={4}
            mr={4}
          >
            <Circle size="80px" bg="gray.200" boxShadow="sm">
              <Icon as={FaThumbsUp} boxSize={8} color="blue.600" />
            </Circle>
            <Text mt={2} fontSize="sm" color="blue.600">리뷰작성</Text>
          </Flex>
        </Flex>
        <br />
        </Box>

        <CouponModal isOpen={isCouponModalOpen} onClose={handleCloseCouponModal} />
        <UserInfoModal 
          isOpen={isInfoModalOpen} 
          onClose={handleCloseInfoModal}
        />
      </Box>
    </>
  );
};

export default UserInfo;
