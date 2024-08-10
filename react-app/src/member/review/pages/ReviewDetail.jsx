import Cookies from 'js-cookie';
import { Flex, Grid, Heading, Spacer, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useUser } from "../../../general/user/contexts/LoginContextProvider";
import { StarRating, TotalStarRating } from "../components/Rating";
import styles from "../css/ReviewDetail.module.css";
import axios from "axios";
import { alert, confirm } from "../../../apis/alert";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ReviewDetail = () => {
  const { id } = useParams();
  const { userInfo } = useUser();
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
  const [flightInfos, setFlightInfos] = useState([]);
  const [loading, setLoading] = useState(true);

  // // 비행정보 불러오기
  const fetchFlightInfo = async () => {
    const token = Cookies.get('accessToken');
      if (!token) {
        console.error("토큰을 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8282/flightInfo/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },  
        });
        setFlightInfos(response.data);
        return response.data; // 리뷰 정보 조회에 활용하기 위해 반환
      } catch (error) {
        console.error("Error fetching flight info:", error);
      }
    };

  const fetchReviewInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8282/review/detail/` + id
      );
      setReview(response.data);
    } catch (error) {
      alert("Error", "조회 실패", "error");
    }
  };

  // 리뷰 조회하기
  useEffect (() => {
    const fetchData = async () => {
        try {
          const flightInfo = await fetchFlightInfo(); // 비행정보 먼저 가져오기
          if (flightInfo) { // 유효성 체크한 후에 리뷰정보 호출
            await fetchReviewInfo();
          }
        } catch (error) {
          console.error("데이터를 가져오는 데 오류가 발생했습니다:", error);
        } finally {
          setLoading(false); // 로딩 종료
        }
    };
    fetchData();
  }, []);

  const flightInfo = flightInfos.find((info) => info.review && info.review.id === review.id);
  const UpdateBtn = () => {
    navigate("/mypage/review/update/" + id, { state: { flightInfo } });
  };

  // 리뷰 삭제하기
  const DeleteBtn = () => {
    confirm("정말 삭제하시겠습니까?", "작성한 리뷰를 삭제합니다", "warning",
        (result) => {
        if (result.isConfirmed) {
          axios({
            method: "delete",
            url: "http://localhost:8282/review/delete/" + id,
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
      <Heading fontSize={50}>"{review.title}"</Heading>
      <Flex className="flightInfo">
        <Flex paddingLeft={10} marginBottom={5}>
          <Text fontSize={23}>{flightInfo.airlineName}</Text>&nbsp;&nbsp;&nbsp;
          <TotalStarRating rate={totalRate} /><div>({totalRate})</div>
        </Flex>
        <Spacer/>
        <Text marginTop={5} fontSize={18} className="userInfo">
          작성자:&nbsp;&nbsp;&nbsp;{userInfo.name}
        </Text>
      </Flex>
      <Flex fontSize={18} paddingLeft={10}>
        <Text className="flightInfo">탑승일:&nbsp;&nbsp;&nbsp;{flightInfo.depSch}</Text>
        <Spacer/>
        <Text className="userInfo">작성일:&nbsp;&nbsp;&nbsp;{review.date}</Text>
      </Flex>
      <div className="review_body">
        <Text className={styles.reviewContent}>{review.content}</Text>
        <div className={styles.rateBody}>
          <Grid templateColumns="repeat(2, 1fr)" fontSize={20} gap={50}>
            <Flex paddingLeft={10} marginBottom={5}>
              좌석 공간 및 편안함:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.seat_rate} />
            </Flex>
            <Flex paddingLeft={10} marginBottom={5}>
              청결도:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.clean_rate} />
            </Flex>
          </Grid>
          <Grid templateColumns="repeat(2, 1fr)" fontSize={20} gap={50}>
            <Flex paddingLeft={10} marginBottom={5}>
              체크인 및 탑승:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.procedure_rate} />
            </Flex>
            <Flex paddingLeft={10} marginBottom={5}>
              라운지:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.lounge_rate} />
            </Flex>
          </Grid>
          <Grid
            templateColumns="repeat(2, 1fr)"
            fontSize={20}
            marginBottom={35}
            gap={50}
          >
            <Flex paddingLeft={10} marginBottom={5}>
              기내 서비스:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.service_rate} />
            </Flex>
            <Flex paddingLeft={10} marginBottom={5}>
              기내식 및 음료:&nbsp;&nbsp;&nbsp;
              <StarRating rate={review.flightmeal_rate} />
            </Flex>
          </Grid>
        </div>
      </div>
      <div className={styles.reviewBtn}>
        <button
          className={`${styles.btn} ${styles.updatebtn}`}
          onClick={UpdateBtn}
        >
          수정
        </button>
        <button
          className={`${styles.btn} ${styles.deletebtn}`}
          onClick={DeleteBtn}
        >
          삭제
        </button>
      </div>
    </>
  );
};

export default ReviewDetail;
