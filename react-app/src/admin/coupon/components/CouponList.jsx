import React from "react";
import { useCoupon } from "../contexts/CouponContext";
import { Box, Text, IconButton, Divider, SimpleGrid, Flex } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";

const CouponList = () => {
  const { coupons, deleteCoupon } = useCoupon();

  const handleDelete = (couponId) => {
    Swal.fire({
      title: "삭제 확인",
      text: "이 쿠폰을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCoupon(couponId);
        Swal.fire("삭제 완료", "쿠폰이 삭제되었습니다.", "success");
      }
    });
  };

  return (
    <Box 
      p={10} 
      mt={9}
      mb={20}
      bg={"white"} 
      borderRadius="50px"
      boxShadow="lg" 
      width="1150px" 
      height="800px" 
    >
      <Text fontSize="22px" fontWeight="800" fontFamily="Noto Sans KR" ml={2}>
        총 {coupons.length}개
      </Text>

      <Divider borderColor="gray.300" mt={2} mb={10} />

      <Box 
        bg="gray.50" 
        paddingTop="50px"
        paddingLeft="50px"
        paddingRight="50px"
        paddingBottom="50px"
        ml={8}
        borderRadius="20px" 
        overflowY="auto" 
        width="1000px"
        height="600px" 
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#B6C5DD',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#7190ac',
          },
        }}
      >
        {coupons.length === 0 ? (
          <Flex align="center" justify="center" height="100%">
            <Text fontSize="20px" color="gray.500" fontFamily="Noto Sans KR">
              현재 쿠폰 목록이 없습니다.
            </Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={7}>
            {coupons.map((coupon) => (
              <Box 
                key={coupon.id} 
                _hover={{ transform: "scale(1.02)", transition: "transform 0.2s ease" }} 
              >
                <Flex align="center">
                  <Box
                    pt={6}
                    pb={6}
                    pl={6}
                    pr={2}
                    width="340px"
                    backgroundColor="white"
                    position="relative"
                    border="1px solid #C0D7DE"
                    borderRight="2px dashed #C9D4E8" 
                    borderRadius="md"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <Flex
                      direction="row"
                      justify="space-between"
                      align="center"
                      mb={2}
                      width="100%"
                    >
                      <Text fontSize="16px" color="#2a6cb9"flex="1" textAlign="left">
                        {coupon.description}
                      </Text>
                      <Text fontSize="12px" color="gray.600" textAlign="right" whiteSpace="nowrap">
                        [ {coupon.airline_name} ]
                      </Text>
                    </Flex>

                    <Flex align="center" mb={1}>
                      <Text fontSize="30px" fontWeight="bold">
                        {coupon.percent} 
                      </Text>
                      <Text ml={1} fontSize="20px" fontWeight="normal">
                        % 할인
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" p={0}>
                      {coupon.code}
                      <IconButton
                        aria-label="삭제"
                        icon={<DeleteIcon />}
                        variant="ghost"
                        color="gray.500"
                        size="lg"
                        onClick={() => handleDelete(coupon.id)}
                        transition="color 0.3s ease"
                        _hover={{ color: "gray.600", transform: "translateY(-2px)" }}
                      />
                    </Text>
                  </Box>
                  <Box 
                    width="100px" 
                    backgroundColor="#DDE6F5" 
                    borderRadius="8px"  
                    borderTop="1px solid #e2e8f0"
                    borderBottom="1px solid #e2e8f0"
                    borderRight="1px solid #e2e8f0"
                    height="183px" 
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)" 
                  />
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default CouponList;
