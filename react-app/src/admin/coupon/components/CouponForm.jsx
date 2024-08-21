import React, { useState, useEffect } from "react";
import { useCoupon } from "../contexts/CouponContext";
import { Box, Button, FormControl, FormLabel, Input, Grid, Flex, InputRightElement, InputGroup, Image, Alert, AlertIcon } from "@chakra-ui/react";
import airplane3 from '../../../assets/images/admin/airplane3.webp';
import { validateCoupon } from '../utils/validateCoupon'; 

const CouponForm = () => {
  const { coupons, addCoupon } = useCoupon(); 
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [description, setDescription] = useState("");
  const [airlineName, setAirlineName] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
  }, [coupons]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateCoupon(couponCode, discountPercent, description, coupons);
    if (validationErrors) {
      setErrorMessages(validationErrors);
      return;
    }

    const newCoupon = {
      code: couponCode,
      percent: discountPercent,
      description,
      airline_name: airlineName || "ALL",
    };
    addCoupon(newCoupon);
    resetForm();
    setErrorMessages([]);
  };

  const resetForm = () => {
    setCouponCode("");
    setDiscountPercent("");
    setDescription("");
    setAirlineName("");
  };

  const inputStyles = {
    variant: "flushed",
    width: "260px",
    padding: "0",
    paddingLeft: "10px",
    sx: {
      borderColor: "#cfd9e8e1",
      _hover: { borderColor: "#4d62a8" },
      _focus: { borderColor: "#4d62a8", boxShadow: "none" },
      "::placeholder": {
        color: "#9ba4b2d0",
      },
      textAlign: "left",
      fontFamily: "Noto Sans KR",
      fontSize: "16px !important",
    },
  };

  return (
    <Box p={5} maxWidth="900px" margin="0 auto">
      <Flex direction="row">
        <Box
          mt={10}
          textAlign="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="250px"
          width="360px"
          overflow="hidden"
        >
          <Image
            src={airplane3}
            alt="Airplane"
            boxSize="310px"
            objectFit="cover"
            mb={3}
          />
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="1fr 1.5fr" gap={4} mt={10}>
            {/* 쿠폰 코드 입력폼 */}
            <FormControl>
              <Flex align="center" justify="center">
                <FormLabel fontSize="19px" textAlign="center" fontFamily="Noto Sans KR" fontWeight="bold">쿠폰 코드</FormLabel>
              </Flex>
            </FormControl>
            <FormControl>
              <Input
                {...inputStyles}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="EX) SUMMER2024"
              />
              <Box borderBottom="2px" borderColor="#93ADD5" width="270px" />
            </FormControl>

            {/* 할인 퍼센트 입력폼 */}
            <FormControl>
              <Flex align="center" justify="center">
                <FormLabel fontSize="19px" textAlign="center" fontFamily="Noto Sans KR" fontWeight="bold">할인 퍼센트</FormLabel>
              </Flex>
            </FormControl>
            <FormControl>
              <InputGroup width="auto">
                <Input
                  {...inputStyles}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="20"
                />
                <InputRightElement width="2.5rem">
                  <span>%</span>
                </InputRightElement>
              </InputGroup>
              <Box borderBottom="2px" borderColor="#93ADD5" width="270px" />
            </FormControl>

            {/* 설명 입력폼 */}
            <FormControl>
              <Flex align="center" justify="center">
                <FormLabel fontSize="19px" textAlign="center" fontFamily="Noto Sans KR" fontWeight="bold">설명</FormLabel>
              </Flex>
            </FormControl>
            <FormControl>
              <Input
                {...inputStyles}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명을 입력하세요"
              />
              <Box borderBottom="2px" borderColor="#93ADD5" width="270px" />
            </FormControl>

            {/* 항공사 이름 입력폼 */}
            <FormControl>
              <Flex align="center" justify="center">
                <FormLabel fontSize="19px" textAlign="center" fontFamily="Noto Sans KR" fontWeight="bold">항공사 이름</FormLabel>
              </Flex>
            </FormControl>
            <FormControl>
              <Input
                {...inputStyles}
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                placeholder="항공사 이름을 입력하세요"
              />
              <Box borderBottom="2px" borderColor="#93ADD5" width="270px" />
            </FormControl>
          </Grid>

          {errorMessages.length > 0 && (
            <Box mt={6}>
              {errorMessages.map((message, index) => (
                <Alert status="error" bg="transparent" key={index} p={0} pl={200} mt={2} ml={1}>
                  <AlertIcon boxSize={4} color="#93ADD5" />
                  <Box fontSize="sm" color="#494d51">
                    {message}
                  </Box> 
                </Alert>
              ))}
            </Box>
          )}

          <Flex justifyContent="flex-end" mt={10}>
            <Button
              type="submit"
              bg="#dde6f5d7"
              color="black"
              width="120px"
              _hover={{ bg: "#8897c8", color: "white", transform: "translateY(-2px)" }}
              transition="background-color 0.3s ease, transform 0.2s ease"
            >
              쿠폰 추가
            </Button>
          </Flex>
        </form>
      </Flex>
    </Box>
  );
};

export default CouponForm;
