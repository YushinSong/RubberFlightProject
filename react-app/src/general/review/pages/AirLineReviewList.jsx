
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/AirLineReviewList.module.css';
import { Box, Flex, Image, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import AirlineReviewItem from '../components/AirlineReviewItem';
import Header from '../../common/Header/Header';
import { Link } from 'react-router-dom';
import "../../../Global/font.css";
import Logo from "../../../assets/images/main_review/reviewlogo.webp";

const AirLineReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0); // 초기 페이지 번호 설정
  const [pageSize] = useState(6); // 한 페이지에 보여줄 리뷰 개수
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [airlineNames, setAirlineNames] = useState([]);
  const [selectedAirlineId, setSelectedAirlineId] = useState(null); // 선택된 항공사 ID
  const backUrl = process.env.REACT_APP_BACK_URL;

  // 모든 리뷰 목록 불러오기(최신순, 별점순)
  const fetchReviews = async (type, page, airlineId) => {
    try {
      let url;
      if (airlineId === null) {
        url = `${backUrl}/airlinereview/${type}?page=${page}&size=${pageSize}`;
      } else {
        url = `${backUrl}/airlinereview/${type}/${airlineId}?page=${page}&size=${pageSize}`;
      }
      const response = await axios.get(url);
      setReviews(response.data.content); // 리뷰 목록 리스트
      setTotalPages(response.data.totalPages); // 총 페이지
    } catch (error) {
      console.error("리뷰를 가져오는 데 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  // 저장된 항공사 이름 불러오기
  const fetchAirline = async () => {
    try {
      const response = await axios.get(`${backUrl}/airlinereview/namelist`);
      setAirlineNames(response.data);
    } catch (error) {
      console.error("항공사 이름을 가져오는 데 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (sortOrder === "latest") {
        await fetchReviews("list", currentPage, selectedAirlineId);
      } else {
        await fetchReviews("ratelist", currentPage, selectedAirlineId);
      }
      await fetchAirline();
    };
    fetchData();
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.overflowY = "scroll";
    document.body.style.boxSizing = "border-box";
  }, [currentPage, sortOrder, selectedAirlineId]);

  // 버튼 클릭 핸들러
  const handleLatestClick = () => {
    setSortOrder("latest"); // 정렬 방식을 최신순으로 설정
    setCurrentPage(0); // 페이지를 0으로 리셋
  };

  const handleRateClick = () => {
    setSortOrder("rating"); // 정렬 방식을 별점순으로 설정
    setCurrentPage(0); // 페이지를 0으로 리셋
  };

  // 항공사 이름 클릭 시 필터링
  const handleAirlineClick = (id) => {
    setSelectedAirlineId(id); // 선택된 항공사 ID 설정
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
      <Header isMain={false} />
      <div className={styles.container}>
        <Flex justifyContent='end' p='80px 100px'>
          <div className={styles.title}>
            <div className={styles.title1}>
              수많은 항공사에 대해 궁금하신가요?
            </div>
            <div className={styles.title2}>
              여러 사람들이 이용한 다양한 항공사들의<br/> 생생한 후기를 확인해보세요
            </div>
          </div>
          <div><img className={styles.logo} src={Logo}/></div>
        </Flex>

        <div className={styles.reviewcontainer}>
          {/* 사이드바 */}
          <div className={styles.airlineMenu}>
            <div className={styles.name}>
              <Link to={"/review"} onClick={() => handleAirlineClick(null)}>항공사 전체</Link>
            </div>
            <hr className={styles.nameline} />

            {/* 항공사 리스트 */}
            <div className={styles.airlineList}>
              {airlineNames && airlineNames.map((airline) =>
                <div key={airline.id} onClick={() => handleAirlineClick(airline.id)} 
                className={`${styles.name} ${selectedAirlineId === airline.id ? styles.click : ''}`}>
                  <p className={styles.airlineName}>{airline.name}</p>
                </div>
              )}
            </div>
          </div>


          <div className={styles.reviewBody}>
            <Tabs variant="line">
              <TabList>
                <Tab fontSize={20} _selected={{ color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }} onClick={handleLatestClick}>
                  최신순
                </Tab>
                <Tab fontSize={20} _selected={{ color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }} onClick={handleRateClick}>
                  별점순
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => {
                      return (<AirlineReviewItem key={review.id} index={index} review={review} />);
                    })
                  ) : (<div className={styles.noReview}>작성된 리뷰가 없습니다.</div>)}
                </TabPanel>
                <TabPanel>
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => {
                      return (<AirlineReviewItem key={review.id} index={index} review={review} />);
                    })
                  ) : (
                    <div className={styles.noReview}>작성된 리뷰가 없습니다.</div>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
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
      </div>
        <div id={styles.footerPart}></div>
    </>
  );
};

export default AirLineReviewList;
