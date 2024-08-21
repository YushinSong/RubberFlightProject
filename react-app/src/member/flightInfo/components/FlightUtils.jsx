// 지연 시간 계산
export const convertDelay = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

// 출발 시간과 도착 시간을 받아 총 비행 시간을 계산
export const calculateFlightDuration = (depTime, arrTime) => {
  const depDate = new Date(depTime);
  const arrDate = new Date(arrTime);
  
  if (arrDate < depDate) {
    arrDate.setDate(arrDate.getDate() + 1); 
  }

  const duration = (arrDate - depDate) / (1000 * 60);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return `${hours}시간 ${minutes}분`;
};
 
 // 주어진 항공편 정보에 따라 상태 텍스트와 색상을 표시
 export const getStatusText = (flight) => {
   const now = new Date();
   const depDate = new Date(flight.depSch);
   const arrDate = new Date(flight.arrSch);
 
   if (flight.reserve.isended) {
     return { text: '도착', color: '#4285f4ff' };
   } else if (now >= depDate && now <= arrDate) {
     return { text: '출발', color: 'blue.500' };
   } else {
     return { text: '마감 예정', color: '#4285f4ff' };
   }
 };
 