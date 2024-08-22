import React, { useEffect, useState } from "react";
import { Box, Flex, Grid, Heading, Image, Spacer, Spinner, Text } from "@chakra-ui/react";
import { StarRating } from "../components/Rating";
import styles from "../css/ReviewDetail.module.css";
import axios from "axios";
import { alert, confirm } from "../../../apis/alert";
import { useNavigate, useParams } from "react-router-dom";
import Review from "../../../assets/images/review/review.webp";
import Stamp from "../../../assets/images/review/stamp.webp";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState({
    title: "",
    seat_rate: "",
    service_rate: "",
    procedure_rate: "",
    flightmeal_rate: "",
    lounge_rate: "",
    clean_rate: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const backUrl = process.env.REACT_APP_BACK_URL;

  const fetchReviewInfo = async () => {
    try {
      const response = await axios.get(
        `${backUrl}/review/detail/` + id
      );
      setReview(response.data);
    } catch (error) {
      alert("Error", "조회 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 조회하기
  useEffect (() => {
    fetchReviewInfo();
    document.body.style.overflowY = "scroll";
  }, []);

  const UpdateBtn = () => {
    navigate("/mypage/review/update/" + id);
  };

  const ListBtn = () => {
    navigate("/mypage/review");
  };

  // 리뷰 삭제하기
  const DeleteBtn = () => {
    confirm("정말 삭제하시겠습니까?", "작성한 리뷰를 삭제합니다", "warning",
        (result) => {
        if (result.isConfirmed) {
          axios({
            method: "delete",
            url: `${backUrl}/review/delete/` + id,
          }).then((response) => {
            const { data, status, statusText } = response;
            if (data === 1) {
              alert("Success", "삭제 성공", "success", () =>
                navigate(`/mypage/review`)
              );
            } else {
              alert("Error", "삭제 실패", "error");
            }
          });
        }});
  };

  const totalRate = (
    (review.seat_rate +
      review.service_rate +
      review.procedure_rate +
      review.flightmeal_rate +
      review.lounge_rate +
      review.clean_rate) / 6).toFixed(1);

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
      <Flex align="center" mb={4}>
        <Image src={Review} width="30px" />
        <Heading as="h1" size="lg" ml={3}>나의 리뷰</Heading>
      </Flex>
      <Box
        style={{ 
          maxWidth: '800px', minWidth: '800px',
          margin: 'auto', width: '90%', marginTop: '40px',
          borderWidth: '1px', borderRadius: '8px',
          padding: '20px', marginBottom: '40px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white', zIndex:'2'
      }}>
        <div className={styles.writedate}>작성일:&nbsp;&nbsp;&nbsp;
          {new Date(review.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d{1,2})\.$/, '$1')}</div>
        <div><img src={Stamp} className={styles.stamp}/></div>
        <Flex>
          <div className={styles.reviewtitle}>"{review.title}"</div>
        </Flex>  
        <hr className={styles.line}/>
        <Grid templateColumns='repeat(3, 1fr)' gap={4}>
          <div className={styles.boarding}>
          <div className={styles.subtitle}>Rate</div>
          <div className={styles.reviewRate}><StarRating rate={totalRate} /></div>
          <div className={styles.totalRate}>({totalRate})</div>
          </div>
          <div className={styles.boarding}>
            <div className={styles.subtitle}>Airline</div>
            <div className={styles.airlineName}>{review.flightInfo.airlineName}</div>
          </div>
          <div className={styles.boarding}>
            <div className={styles.subtitle}>Date</div>
            <div className={styles.boardingdate}>
            {new Date(review.flightInfo.depSch).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d{1,2})\.$/, '$1')}
            </div>
          </div>    
        </Grid>
        <hr className={styles.line2}/>
        <div className={styles.reviewBody}>
        {review.content && <div className={styles.content}>{review.content}</div>}
          <div className={styles.rateBody}>
            <Flex>
              <Flex pl='105px' mb={5} gap='50px'>
                <Text mr={3} fontFamily="PTBandocheB">라운지 :</Text>
                <div className={styles.starRate}><StarRating rate={review.lounge_rate} /></div>
              </Flex>
              <Flex pl={10} ml='50px' mb={5} gap='40px'>
              <Text mr={3} fontFamily="PTBandocheB">체크인 및 탑승 :</Text>
                <div className={styles.starRate}><StarRating rate={review.procedure_rate} /></div>
              </Flex>
            </Flex>
            <Flex>
              <Flex pl='105px' mb={5} gap='50px'>
              <Text mr={3} fontFamily="PTBandocheB">청결도 :</Text>
              <div className={styles.starRate}><StarRating rate={review.clean_rate} /></div>
              </Flex>
              <Flex pl={10} mb={5} ml='50px' gap='5px'>
              <Text mr={3} fontFamily="PTBandocheB">좌석 공간 및 편안함 :</Text>
              <div className={styles.starRate}><StarRating rate={review.seat_rate} /></div>
              </Flex>
              </Flex>
            <Flex>
              <Flex pl='105px' mb={5} gap='15px'>
              <Text mr={3} fontFamily="PTBandocheB">기내 서비스 :</Text>
                <div className={styles.starRate}><StarRating rate={review.service_rate} /></div>
              </Flex>
              <Flex pl={10} mb={5} ml='50px' gap='40px'>
              <Text mr={3} fontFamily="PTBandocheB">기내식 및 음료 :</Text>
                <div className={styles.starRate}><StarRating rate={review.flightmeal_rate} /></div>
              </Flex>
            </Flex>
          </div>
        </div>
        </Box>
        <div className={styles.reviewBtn}>
          <button className={`${styles.btn} ${styles.listbtn}`} onClick={ListBtn}></button>
          <button className={`${styles.btn} ${styles.updatebtn}`} onClick={UpdateBtn}></button>
          <button className={`${styles.btn} ${styles.deletebtn}`} onClick={DeleteBtn}></button>
        </div>
      </Box>
    </>
  );
};

export default ReviewDetail;
