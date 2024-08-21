import React, { useEffect, useState } from "react";
import CouponForm from "../components/CouponForm";
import CouponList from "../components/CouponList";
import { Box, Flex, Button, Text } from "@chakra-ui/react";
import Header from "../../../general/common/Header/Header";
import { GiPriceTag } from "react-icons/gi";
import { FaCirclePlus } from "react-icons/fa6";

const CouponPage = () => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = "scroll";
    document.body.style.backgroundColor = "#eef2fc";
  }, []);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <Box p={5} margin="0 auto"> 
      <Header isMain={false} />
      
      <Flex direction="column" align="center" justify="center" >

        <Flex direction="column" mb={10} width="1100px" justify="flex-start"> 
          <Box display="flex">
            <GiPriceTag size="37px"/>  
            <Text as="h1" fontSize="32px" fontFamily="LeferiPoint-BlackA" color="gray.700" pl={6}> 
              쿠폰 관리
            </Text>
          </Box>
          <Box
            mt={10}
            mr={3}
            mb={20}
            display="flex"
          >
            <Text 
              pl={6}
              fontSize="21px" 
              color= "#00235A"
              fontFamily="KIMM_Light"
              letterSpacing="0.5px" 
            >
              사용자가 혜택을 누릴 수 있도록,
              다양한 쿠폰을 추가해 주세요. <br />
              추가된 쿠폰은 모든 사용자에게 제공되어,<br />
              더 많은 혜택을 누릴 수 있는 기회를 드립니다. 
            </Text>
          </Box>
        </Flex>

        <Flex direction="column" align="center" width="1000px">
          <Button
            onClick={handleToggleForm}
            bg="gray.50"
            pb={10}
            pt={10}
            fontSize="22px" 
            borderRadius="50px"
            boxShadow="lg"
            borderBottomLeftRadius={showForm ? "0" : "50px"}
            borderBottomRightRadius={showForm ? "0" : "50px"}
            width="100%"
            _hover={{ bg: "blue.100" }}
            transition="background-color 0.3s ease"
          >
            <Flex justify="space-between" width="100%" align="center">
              <Box textAlign="left" flex="1" ml={8}>
                쿠폰 추가하기
              </Box>
              <Box textAlign="right" mr={6}>
                <FaCirclePlus size="20px"/>
              </Box>
            </Flex>
          </Button>

          <Box
            width="1000px"
            borderTop="none"
            borderBottomLeftRadius="50px"
            borderBottomRightRadius="50px"
            boxShadow="lg"
            bg="white"
            mt="-2px"
            overflow="hidden"
            transition="max-height 0.5s ease, opacity 0.5s ease"
            style={{
              maxHeight: showForm ? "500px" : "0px", 
              opacity: showForm ? 1 : 0, 
            }}
          >
            <CouponForm />
          </Box>
        </Flex>

        <CouponList />
      </Flex>
    </Box>
  );
};

export default CouponPage;
