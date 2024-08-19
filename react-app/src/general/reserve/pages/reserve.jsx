import { Button, styled } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import style from '../css/reserve.module.css';
import { PiAirplaneTakeoffBold } from "react-icons/pi";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import { PiDotOutline } from "react-icons/pi";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import Cookies from 'js-cookie';
import { Dropdown, Menu } from 'antd';


const Reserve = () => {
  // 유저 정보 받기
  const [buyerName, setBuyerName] = useState('');
  const [buyerTel, setBuyerTel] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const token = Cookies.get('accessToken');
  const backUrl = process.env.REACT_APP_BACK_URL;

  // 쿠폰
  const [coupons, setCoupons] = useState([]); // 쿠폰 목록 상태 추가
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택한 쿠폰 상태

    const location = useLocation();
    const { flight, passengers } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://cdn.iamport.kr/v1/iamport.js';
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    useEffect(() => {
      fetch(`${backUrl}/coupon/user/coupons`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched coupons:', data);
        console.log('Type of coupons:', Array.isArray(data)); // 배열인지 확인
        setCoupons(data);
      })
      .catch(error => {
        console.error('Error fetching coupons:', error);
      });
    }, []);

    const CouponDropdown = ({ coupons, onSelectCoupon }) => {
      const menuItems = coupons.length > 0 
      ? coupons.map(coupon => ({
          key: coupon.id,
          label: (
            <a onClick={() => onSelectCoupon(coupon)}>
              {coupon.description} - {coupon.percent}% 할인
            </a>
          )
        }))
      : [{ key: 'no-coupons', label: '사용할 수 있는 쿠폰이 없습니다.' }];
  
    return (
      <Dropdown overlay={<Menu items={menuItems} />} trigger={['click']}>
        <Button>쿠폰 적용하기</Button>
      </Dropdown>
      );
    };
   
    const isRoundTrip = () => {
      return flight.outbound && flight.inbound;
    }

    const isRoundTripValue = isRoundTrip();

    const totalPrice = isRoundTripValue 
    ? flight.outbound.price + flight.inbound.price 
    : flight.price;

  const discountedPrice = selectedCoupon 
    ? Math.floor(totalPrice * (1 - selectedCoupon.percent / 100) / 10) * 10
    : totalPrice;

    const FlightPrice = ({ price }) => {
      return (
        <div>{price.toLocaleString('ko-KR')} 원</div>
      );
    };

    const onClickPayment = () => {
        if (!window.IMP) return;
        /* 1. 가맹점 식별하기 */
        const { IMP } = window;
        IMP.init("imp28617244"); // 가맹점 식별코드
    
        /* 2. 결제 데이터 정의하기 */
        const data = {
          pg: "html5_inicis",
          pay_method: "card",
          merchant_uid: `mid_${new Date().getTime()}`,
          amount: discountedPrice,
          name: "RubberFlight",
          buyer_name: buyerName,
          buyer_tel: buyerTel,
          buyer_email: buyerEmail,
          buyer_addr: "서울특별시 강남구 역삼동 822-2",
          buyer_postcode: "06236",
        };
    
        /* 4. 결제 창 호출하기 */
        IMP.request_pay(data, callback);
      };
    
      /* 3. 콜백 함수 정의하기 */
      function callback(response) {
        const { success, error_msg } = response;
    
        if (success) {
          window.alert("결제 성공");
          const reservationData = {
            personnel: passengers,
            isRoundTrip: isRoundTripValue,
            outboundFlight: isRoundTripValue ? flight.outbound : flight,
            inboundFlight: isRoundTripValue ? flight.inbound : null,
            couponId: selectedCoupon ? selectedCoupon.id : null,
          };
          
          console.log(passengers);
          console.log(isRoundTripValue);
          console.log(flight.outbound);
          console.log(flight);
          console.log(flight.inbound);
          console.log(selectedCoupon.id);

          // const token = Cookies.get('accessToken');

          fetch(`${backUrl}/reservation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reservationData),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('예약 요청 실패');
            }
            return response.json();
          })
          .then(() => {
            if (selectedCoupon) {
              fetch(`${backUrl}/coupon/user/use/${selectedCoupon.id}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              .then(() => {
                console.log(selectedCoupon.id);
                window.alert('결제가 완료되었고, 쿠폰이 삭제되었습니다.');
                navigate('/mypage/flight-info');
              })
              .catch(error => {
                console.error('쿠폰 삭제 중 오류가 발생했습니다:', error);
                window.alert('쿠폰 삭제 중 오류가 발생했습니다.');
              });
            } else {
              navigate('/mypage/flight-info');
            }
          })
          .catch(error => {
            console.error('예약 실패:', error);
            window.alert('예약 처리 중 오류 발생');
          });
        } else {
          window.alert(`결제 실패: ${error_msg}`);
        }
      };


    return (
        <>
        <div className={style.box}>
        <div className={style.boxTitle}>
          <div className={style.boxFont}>선택한 항공권</div>
        </div>

        {flight.outbound && flight.inbound ? (
        <>
          <div className={style.airportInfo}>
            <div className={style.depAirportInfo}>
              <div className={style.airportIcon}><PiAirplaneTakeoffBold /></div>
              <h2>가는 항공편</h2>
              <div className={style.airports}>
                <div>{flight.outbound.depAirport}</div>
                <div className={style.airportArrow}><RiArrowRightDoubleFill /></div>
                <div>{flight.outbound.arrAirport}</div>
              </div>
            </div>

            <div className={style.ticket}>
              <div>{flight.outbound.airlineName}</div>
              <div className={style.depDayTime}>{flight.outbound.depDayFormat}<br/>
                {flight.outbound.depTime}</div>
                <div className={style.takeTime}>               
                  <div className={style.duringTime}><PiDotOutline /></div>
                <div className={style.line}>
                  <div className={style.takeTimeFormat}>{flight.outbound.takeTimeFormat}</div>
                  <div className={style.type}>직항</div>
                </div>
                <div className={style.duringTime2}><PiDotOutline /></div>
                </div>
              <div>{flight.outbound.arrDayFormat}<br/>
                {flight.outbound.arrTime}</div>
              <div><FlightPrice price={flight.outbound.price} /></div>
            </div>

            <div className={style.arrAirportInfo}>
              <div className={style.airportIcon}><PiAirplaneTakeoffBold /></div>
              <h2>오는 항공편</h2>
              <div className={style.airports}>
                <div>{flight.inbound.depAirport}</div>
                <div className={style.airportArrow}><RiArrowRightDoubleFill /></div>
                <div>{flight.inbound.arrAirport}</div>
              </div>
            </div>

            <div className={style.ticket}>
              <div>{flight.inbound.airlineName}</div>
              <div className={style.depDayTime}>{flight.inbound.depDayFormat}<br/>
                {flight.inbound.depTime}</div>
              <div className={style.takeTime}>
                <div className={style.duringTime}><PiDotOutline /></div>
                <div className={style.line}>
                <div className={style.takeTimeFormat}>{flight.outbound.takeTimeFormat}</div>
                  <div className={style.type}>직항</div>
                    </div>
                <div className={style.duringTime2}><PiDotOutline /></div>
              </div>
              <div>{flight.inbound.arrDayFormat}<br/>
                {flight.inbound.arrTime}</div>
              <div><FlightPrice price={flight.inbound.price} /></div>
            </div>
          </div>
        </>
      ) : (
        <>
        <div className={style.airportInfo}>
            <div className={style.depAirportInfo}>
              <div className={style.airportIcon}><PiAirplaneTakeoffBold /></div>
              <h2>가는 항공편</h2>
              <div className={style.airports}>
                <div>{flight.depAirport}</div>
                <div className={style.airportArrow}><RiArrowRightDoubleFill /></div>
                <div>{flight.arrAirport}</div>
              </div>
            </div>

            <div className={style.ticket}>
              <div>{flight.airlineName}</div>
              <div className={style.depDayTime}>{flight.depDayFormat}<br/>
                {flight.depTime}</div>
                <div className={style.takeTime}>               
                  <div className={style.duringTime}><PiDotOutline /></div>
                <div className={style.line}>
                  <div className={style.takeTimeFormat}>{flight.takeTimeFormat}</div>
                  <div className={style.type}>직항</div>
                </div>
                <div className={style.duringTime2}><PiDotOutline /></div>
                </div>
              <div>{flight.arrDayFormat}<br/>
                {flight.arrTime}</div>
              <div><FlightPrice price={flight.price} /></div>
            </div>
          </div>
        </>
      )}
      
      <div className={style.userInfo}>
        <h2>상품 결제 정보</h2> 
        <div>인원 수: {passengers}</div>
        <div>
        <CouponDropdown 
              coupons={coupons} 
              onSelectCoupon={setSelectedCoupon} 
            />
          </div>
          <div>총 가격: {discountedPrice.toLocaleString('ko-KR')} 원</div>
        <Button onClick={onClickPayment}>결제하기</Button>
      </div>

      <div className={style.payUserInfo}>
      <h2>예약자 정보</h2>
      <table className={style.reservationTable}>
      <tbody>
        <tr>
          <td><label htmlFor="buyerName">이름:</label></td>
          <td>
            <input
              type="text"
              id="buyerName"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />
          </td>
          <td><label htmlFor="buyerBirth">생년월일:</label></td>
          <td><input type="text" id="buyerBirth" name="buyerBirth" /></td>
        </tr>
        <tr>
          <td><label htmlFor="buyerEmail">이메일:</label></td>
          <td>
            <input
              type="email"
              id="buyerEmail"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              required
            />
          </td>
          <td><label htmlFor="buyerTel">휴대폰 번호:</label></td>
          <td>
            <input
              type="tel"
              id="buyerTel"
              value={buyerTel}
              onChange={(e) => setBuyerTel(e.target.value)}
              required
            />
          </td>
        </tr>
      </tbody>
    </table>
      </div>
    </div>
    </>
    );
};

export default Reserve;