export const validateCouponCode = (code, existingUserCoupons, existingAdminCoupons) => {
   if (!code) {
     return '쿠폰 코드를 입력해주세요.';
   }
 
   if (code.length < 5) {
     return '쿠폰 코드 길이가 너무 짧습니다.';
   }
 
   if (code.length > 70) {
     return '쿠폰 코드는 70자를 초과할 수 없습니다.';
   }
 
   if (existingUserCoupons.includes(code)) {
     return '이미 보유한 쿠폰입니다.';
   }
 
   if (existingAdminCoupons.includes(code)) {
     return null; 
   }
 
   const regex = /^[A-Za-z0-9-]+$/; 
   if (!regex.test(code)) {
     return '유효하지 않은 쿠폰 코드 형식입니다.';
   }
 
   return '존재하지 않는 쿠폰 코드입니다.'; 
 };
 