import React from "react";
import { Box, Flex, Grid, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { StarRating } from "./Rating";
import { motion } from 'framer-motion';
import styles from "../css/ReviewItem.module.css";
import Flight from "../../../assets/images/review/top1.webp";
import "../../../Global/font.css";

const ReviewItem = ({review}) => {
  const navigate = useNavigate();
  const totalRate = ((review.seat_rate + review.service_rate + review.procedure_rate
     + review.flightmeal_rate + review.lounge_rate + review.clean_rate) / 6).toFixed(1);
  const MotionBox = motion(Box);

  const DetailBtn = () => {
    navigate('/mypage/review/' + review.id); 
   }

  return (
    <>
      <MotionBox
        key={review.id} mb={10} onClick={DetailBtn}
        initial={{ opacity: 0, x: -90, scale: 1 }} animate={{ opacity: 1, x: -40, scale: 1 }}
        whileHover={{ scale: 1.02, x: -40}} exit={{ opacity: 0, x: 0}} 
        transition={{ default: { duration: 0.5 }, scale: { duration: 0.3 }, paddingBottom: { duration: 0.1 }, }}
        position="relative"
        style={{ 
          maxWidth: '850px', minWidth: '850px',
          margin: 'auto', width: '90%',
          borderWidth: '1px', borderRadius: '8px',
          padding: '20px', marginTop: '-2px',
          marginBottom: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white', cursor: 'pointer',
          transition: 'background-color 0.3s ease, transform 0.3s ease'
        }}
      >
        <Flex mb={-5}>
          <div><img src={Flight} className={styles.top}/></div>
          <div className={styles.topname}>LOVER AIR</div>
          <Flex>
              <div className={styles.reivewRate}><StarRating rate={totalRate} /></div>
              <div className={styles.totalScore}>({totalRate})</div>
            </Flex>
            <Spacer/>
          <div className={styles.writeDate}>
          {new Date(review.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d{1,2})\.$/, '$1')}</div>
        </Flex>
        <hr className={styles.line}/>
        <Grid templateColumns='repeat(3, 1fr)' gap={6} mt={8}> 
          <div>
            <div className={styles.reviewTitle}>"{review.title}"</div>
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
      </MotionBox>
    </>
  );
};

export default ReviewItem;
