import React, { createContext, useState, useEffect } from "react";
import { getFlightInfo } from "../../../apis/flightApis"; 

export const FlightInfoContext = createContext();

export const FlightInfoProvider = ({ children }) => {
  const [flightInfo, setFlightInfo] = useState(null);
  const [history, setHistory] = useState([]);
  // const [historyDep, setHistoryDep] = useState([]);
  // const [historyArr, setHistoryArr] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [flightId, setFlightId] = useState(null);

  const fetchFlightData = async () => {
    if (flightId) {

      try {
        const response = await getFlightInfo(flightId);
        const fetchedData = response.data; 

        setFlightInfo(fetchedData.flightInfo || null);
        setHistory(fetchedData.history || []);
        setTimetable(fetchedData.timetable || []);

        console.log("예약 데이터:", fetchedData.flightInfo);
        console.log("지난 예약 데이터:", fetchedData.history);
        console.log("예정된 예약 데이터:", fetchedData.timetable);

      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    }
  };

  useEffect(() => {
    fetchFlightData();
  }, [flightId]);

  return (
    <FlightInfoContext.Provider value={{ flightInfo, history, timetable, setFlightId }}>
      {children}
    </FlightInfoContext.Provider>
  );
};
