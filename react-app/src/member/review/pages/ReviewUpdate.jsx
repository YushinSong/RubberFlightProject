import React, { useEffect, useState } from "react";
import { useUser } from "../../../general/user/contexts/LoginContextProvider";
import { Box, Flex, Heading, Image, Spacer, Textarea } from "@chakra-ui/react";
import { RateFormUpdate } from "../components/Form";
import axios from "axios";
import {alert} from '../../../apis/alert';
import { useNavigate, useParams } from "react-router-dom";
import Write from "../../../assets/images/review/reviewwrite.webp";
import styles from '../css/ReviewUpdate.module.css';
import Flight from "../../../assets/images/review/top1.webp";
import Stamp from "../../../assets/images/review/stamp.webp";

const ReviewUpdate = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const backUrl = process.env.REACT_APP_BACK_URL;
  const [review, setReview] = useState({
    title: "",
    seat_rate : "",
    service_rate: "",
    procedure_rate: "",
    flightmeal_rate: "",
    lounge_rate: "",
    clean_rate: "", 
    content:""
  });

  useEffect(() => {
    axios({
      method: "get",
      url: `${backUrl}/review/detail/` + id,
    })
      .then(response => {
        const { data, status, statusText } = response;
        if (status === 200) {
          setReview(data);
        } else {
          alert('Error', '조회 실패', 'error');
        }
      });
    document.body.style.overflowY = "scroll";
  },[]);

  // 수정할 데이터 입력하기
  const changeValue = (name, value) => {
    setReview((prevReview) => ({
      ...prevReview,
      [name] : value
    }));
  }

  // 유효성 검증 폼
const [error, setError] = useState('');
const validateForm = () => {
  let newError = {title:'', content:''};

  if (!review.title.trim()){ 
    newError.title = "제목을 작성해주세요";
  } else if (review.title.trim().length > 25) {
    newError.title = "제목은 25자 이내로 작성해주세요";
  }
  if (review.content.length > 200) newError.content = "내용은 200자 이내로 입력해주세요";
  
  setError(newError);
  return Object.keys(newError).some(key => newError[key]);
};

 // 데이터 수정하기
const submitReview = (e) => {
  e.preventDefault();
  
  const validationError = validateForm();
  console.log(review);
  let provide = {
    id: review.id,
    title: review.title,
    seat_rate : review.seat_rate,
    service_rate: review.service_rate,
    procedure_rate: review.procedure_rate,
    flightmeal_rate: review.flightmeal_rate,
    lounge_rate: review.lounge_rate,
    clean_rate: review.clean_rate, 
    content: review.content
  };
  console.log(provide);
  if(!validationError){
    axios({
      method: "put",
      url: `${backUrl}/review/update`,
      headers: {
          "Content-Type": 'application/json',
      },
      data: JSON.stringify(review),
  })
    .then(response => {
        const { data, status, statusText } = response;
        if (status === 200) {
          alert('Success', '수정 성공', 'success',
            () => navigate(`/mypage/review/${data.id}`));
        } else {
          alert('Error', '수정 실패', 'error');
        }
    });
  }    
}

const prev = () => {
  navigate(-1);
}

  return (          
    <>
    <Box p={4}>
        <Flex align="center" mb={4} >
          <Image src={Write} width="30px" />
          <Heading as="h1" size="lg" ml={3}>리뷰 수정</Heading>
        </Flex>
        {review.flightInfo &&
        <Flex paddingLeft={10} gap={10} mb='10px' mt='-20px' mr='50px' justify='right'>
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
        </Flex>}
        <hr/>
        <form onSubmit={submitReview}>
          <Box
            style={{ 
              maxWidth: '800px', minWidth: '800px',  
              margin: 'auto', width: '90%',
              borderWidth: '1px', borderRadius: '8px',
              padding: '20px', marginTop: '30px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white'
          }}>
            <Flex mt='10px'>
              <div><img src={Flight} className={styles.top}/></div>
              <div>
                <input type="text" name="title" id={styles.inputTitle} placeholder="제목을 작성해주세요"
                  value={review.title} onChange={(e) => changeValue(e.target.name, e.target.value)}/>
                {error && <div className={styles.errorMessage}>{error.title}</div>}
              </div>
              </Flex>
              <hr/>
              <div className={styles.formInput}>
                <Flex gap='50px'>
                <div className={styles.question}>Q. 라운지 시설과 이용은 어떠셨나요?</div>
                <RateFormUpdate name='lounge_rate' rate={review.lounge_rate} changeValue={changeValue}/>
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.lounge_rate}</div>}
              </div>
              <div className={styles.formInput}>
                <Flex gap='20px'>
                <div className={styles.question}>Q. 체크인과 탑승이 원활히 이루어졌나요?</div>
                <RateFormUpdate name='procedure_rate' rate={review.procedure_rate} changeValue={changeValue} />
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.procedure_rate}</div>}
              </div>
              <div className={styles.formInput}>
                <Flex gap='86px'>
                <div className={styles.question}>Q. 비행기의 시설은 깨끗했나요?</div>
                <RateFormUpdate name='clean_rate' rate={review.clean_rate} changeValue={changeValue} />
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.clean_rate}</div>}
              </div>
              <div className={styles.formInput}>
                <Flex >
                <div className={styles.question}>Q. 비행기 좌석 공간과 편안함은 어떠셨나요?</div>
                <RateFormUpdate name='seat_rate' rate={review.seat_rate} changeValue={changeValue} />
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.seat_rate}</div>}
              </div>
              <div className={styles.formInput}>
                <Flex gap='103px'>
                <div className={styles.question}>Q. 기내 서비스는 어떠셨나요?</div>
                <RateFormUpdate name='service_rate' rate={review.service_rate} changeValue={changeValue} />
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.service_rate}</div>}
              </div>
              <div className={styles.formInput}>
                <Flex gap='48px'>
                <div className={styles.question}>Q. 기내식 및 음료는 잘 제공되었나요?</div>
                <RateFormUpdate name='flightmeal_rate' rate={review.flightmeal_rate} changeValue={changeValue} />
                </Flex>
                {error && <div className={styles.errorMessagerRate}>{error.flightmeal_rate}</div>}
              </div>
              <div className={styles.formInput}>
              <div className={`${styles.question}, ${styles.contentQ}`}>Q. 더 하고 싶은 말을 적어주세요~</div>
              <textarea name="content" value={review.content}  className={styles.reviewcontent}
               placeholder="내용은 200자 이내로 적어주세요" onChange={(e) => changeValue(e.target.name, e.target.value)}/>
              {error && <div className={styles.errorMessage}>{error.content}</div>}
            </div>
            <div><img src={Stamp} className={styles.stamp}/></div>
          </Box>
          <div className={styles.reviewBtn}>
            <button type='button' className={`${styles.btn} ${styles.prevbtn}`} onClick={prev}></button>
            <button type='submit' className={`${styles.btn} ${styles.writebtn}`}></button>
          </div>
        </form>
      </Box>
    </>
  );
};

export default ReviewUpdate;
