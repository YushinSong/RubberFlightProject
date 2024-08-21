import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel, Text, Box } from '@chakra-ui/react';
import FlightInfoCard from './FlightInfoCard';
import { Flex } from 'antd';

const FlightInfoTabs = ({ pastFlights = [], upcomingFlights = [], reviewList = [] }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  return (
    <Tabs
      variant="line"
      onChange={handleTabChange}
      mt={7}
      ml={7}
      mr={7}
      mb={7}
    >
      <TabList>
        <Tab _selected={{ color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }}>
          예정된 예약
        </Tab>
        <Tab _selected={{ color: "#6d9eeb", borderBottom: "2px solid #6d9eeb", fontWeight: "bold" }}>
          지난 예약
        </Tab>
      </TabList>
      <TabPanels
        style={{
          maxWidth: '800px',
          minWidth: '800px',
          width: '90%',
          height: '680px',
          margin: 'auto',
          marginTop: '20px',
          overflowY: 'auto',
          position: 'relative',
        }}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6d9eeb', 
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#4b8dc3', 
          },
        }}
      >
        <TabPanel>
          {upcomingFlights.length > 0 ? (
            <Flex direction="row" align="flex-start">
              <Box flex="1">
                {upcomingFlights.map((flight) => (
                  <FlightInfoCard key={flight.id} flight={flight} isPast={false} />
                ))}
              </Box>
            </Flex>
          ) : (
            <Text fontFamily="Noto Sans KR" fontWeight="700">예약된 항공편이 없습니다.</Text>
          )}
        </TabPanel>

        <TabPanel>
          {pastFlights.length > 0 ? (
            <Flex direction="row" align="flex-start">
              <Box flex="1">
                {pastFlights.map((flight) => {
                  const review = reviewList.find((review) => flight.id === review.flightInfo.id);
                  return (
                    <FlightInfoCard 
                      key={flight.id} 
                      flight={flight} 
                      isPast={true} 
                      review={review} 
                    />
                  );
                })}
              </Box>
            </Flex>
          ) : (
            <Text fontFamily="Noto Sans KR" fontWeight="700">지난 예약된 항공편이 없습니다.</Text>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FlightInfoTabs;
