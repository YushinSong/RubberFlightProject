import Cookies from 'js-cookie';
import React, { useEffect, useState } from "react";
import { Box, Flex, Image, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import axios from "axios";
import Review from "../../../assets/images/review/review.webp";
import styles from "../css/ReviewList.module.css";
import ReviewItem from "../components/ReviewItem";
import "../../../Global/font.css";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0); // 초기 페이지 번호 설정
  const [pageSize] = useState(3); // 한 페이지에 보여줄 리뷰 개수
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // 해당 유저 리뷰 목록 불러오기(최신순, 별점순)
  const fetchReviewList = async (type, page) => {
    const token = Cookies.get('accessToken');
    const backUrl = process.env.REACT_APP_BACK_URL;
    if (!token) {
      console.error("토큰을 찾을 수 없습니다.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(
        `${backUrl}/review/${type}?page=${page}&size=${pageSize}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews(response.data.content); // 리뷰 목록 리스트
      setTotalPages(response.data.totalPages); // 총 페이지
    } catch (error) {
      console.error("리뷰를 가져오는 데 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 첫화면 로딩
  useEffect(() => {
    if (sortOrder === "latest") {
      fetchReviewList("list", currentPage);
    } else {
      fetchReviewList("ratelist", currentPage);
    } 
    document.body.style.overflowY = "scroll";
  }, [currentPage, sortOrder]);

  // 버튼 클릭 핸들러
  const handleLatestClick = () => {
    setSortOrder("latest"); // 정렬 방식을 최신순으로 설정
    setCurrentPage(0); // 페이지를 0으로 리셋
  };

  const handleRateClick = () => {
    setSortOrder("rating"); // 정렬 방식을 별점순으로 설정
    setCurrentPage(0); // 페이지를 0으로 리셋
  };

  // 페이지 이동 핸들러
  const handlePageChange = (page) => {
    if (page >= 0 && page <= totalPages - 1) setCurrentPage(page);
  };

  // 페이지 버튼을 생성하는 함수
  const pageButtons = (totalPages) => {
    const buttons = [];
    const groupSize = 5; // 한 그룹에 보여줄 페이지 수
    const currentGroup = Math.floor(currentPage / groupSize); // 현재 페이지가 속한 그룹 계산
    const startPage = currentGroup * groupSize; // 현재 그룹의 시작 페이지 계산
    // const totalGroups = Math.ceil(totalPages / 5); // 5개씩 그룹
    // Array.from({ length: totalGroups }).forEach((_, btnIndex) => {
    //   const startPage = btnIndex * 5; // 시작 페이지 번호
    //   const pageGroup = [];

    // 현재 그룹의 페이지 버튼 생성
    for (let i = 0; i < groupSize && startPage + i < totalPages; i++) {
      const pageNumber = startPage + i;
      buttons.push(
        <button
        className={`${styles.reviewPageBtn} ${currentPage === pageNumber ? styles.pageClick: ''}`}
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          disabled={pageNumber >= totalPages} // 유효한 페이지 번호인지 확인
        >
          {pageNumber + 1} {/* 실제로 표시할 때는 1을 더해줌 */}
        </button>
      );
    }
    return buttons;
  };

  // 로딩 화면
  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Box p={4}>
        <Flex align="center" mb={4} >
          <Image src={Review} width="30px" />
          <Text as="h1" size="lg" ml={3} color="#0e0e0f" fontFamily= "Roboto" fontSize="27px" fontWeight="bold">나의 리뷰</Text>
        </Flex>
        <div id={styles.reviewBody}>
          <Tabs variant="line" mt={7} ml={7} mr={7}>
            <TabList>
              <Tab _selected={{color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }}
              onClick={handleLatestClick}>
                최신순
              </Tab>
              <Tab _selected={{color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }}
              onClick={handleRateClick}>
                별점순
              </Tab>
            </TabList>
            <TabPanels
            style={{
              maxWidth: '800px',
              minWidth: '800px',
              margin: 'auto',
              marginTop: '10px',
              width: '90%',
            }}
            >
              <TabPanel>
                {reviews.length > 0 ? reviews.map((review) => {
                    return (<ReviewItem key={review.id} review={review} />);})
                  : <div className={styles.noReview}>작성된 리뷰가 없습니다.</div>} 
              </TabPanel>
              <TabPanel>
                {reviews.length > 0 ? reviews.map((review) => {
                    return (<ReviewItem key={review.id} review={review} />);})
                  : <div className={styles.noReview}>작성된 리뷰가 없습니다.</div>} 
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
        {totalPages > 0 && (
          <Box className={styles.reviewPagebtn}>
            <button className={`${styles.reviewPagebtn} ${styles.reviewPageBtn} ${styles.reviewPrevbtn}`}
              onClick={() => handlePageChange(0)}>◀◀</button>
            <button className={`${styles.reviewPageBtn} ${styles.reviewPrevbtn} ${styles.reviewArrowLeft}`}
              onClick={() => handlePageChange(currentPage - 1)}>◀</button>
            {pageButtons(totalPages)}
            <button className={`${styles.reviewPageBtn} ${styles.reviewNextbtn} ${styles.reviewArrowRight}`}
              onClick={() => handlePageChange(currentPage + 1)}>▶</button>
            <button className={`${styles.reviewPageBtn} ${styles.reviewNextbtn}`}
              onClick={() => handlePageChange(totalPages - 1)}>▶▶</button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ReviewList;
