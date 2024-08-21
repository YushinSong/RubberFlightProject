import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCountryInfo } from '../../../apis/countryApis';
import { getAirportInfo2 } from '../../../apis/airportApis';
import { Input, Button } from '@chakra-ui/react';
import styles from '../CSS/EditCA.module.css';
import '../../../Global/font.css';
import Header from '../../../general/common/Header/Header';
import '../../../apis/alert.js';

import Delete from '../../../assets/images/admin/trash.webp'
import Airplain from '../../../assets/images/admin/airplane.webp'
import Airport from '../../../assets/images/admin/airport.webp'
import { alert } from '../../../apis/alert.js';

const EditCA = () => {
    const [countrys, setCountry] = useState([]);
    const [countryIsoInput, setCountryIsoInput] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(null);

    const [airports, setAirport] = useState([]);
    const [airportIataInput, setAirportIataInput] = useState("");
    const [selectedAirport, setSelectedAirport] = useState(null);
    const backUrl = process.env.REACT_APP_BACK_URL;

    useEffect(() => {
        document.body.style.backgroundColor = '#eef2fc';
        // document.body.style.backgroundColor = '#eceefa';
        document.body.style.overflowY = 'scroll';
    }, []);

    // 전체 나라 목록 가져오기
    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${backUrl}/country/list`);
            const { data, status } = response;
            if (status === 200) {
                setCountry(data);
                if (data.length > 0) {
                    const firstCountry = data[0];
                    setSelectedCountry(firstCountry);
                    fetchAirportsByCountry(firstCountry.id);
                }
            }
        } catch (error) {
            console.error("Error fetching country list:", error);
        }
    };

    // 선택한 나라의 공항 목록 가져오기
    const fetchAirportsByCountry = async (countryId) => {
        try {
            const response = await axios.get(`${backUrl}/airport/detail/${countryId}`);
            const { data, status } = response;
            if (status === 200) {
                setAirport(data);
                if (data.length > 0) {
                    setSelectedAirport(data[0]);
                }else {
                    setSelectedAirport(null); // 공항 정보가 없을 때 null로 설정
                }
            }
        } catch (error) {
            console.error("Error fetching airport list:", error);
            setSelectedAirport(null);
        }
    };

    // 컴포넌트 마운트 시 나라 목록 가져오기
    useEffect(() => {
        fetchCountries();
    }, []);

    // 나라 클릭 시 해당 나라의 공항 목록 불러오기
    const handleCountryClick = (countryId) => {
        const selected = countrys.find(country => country.id === countryId);
        setSelectedCountry(selected);
        setSelectedAirport(null);
        fetchAirportsByCountry(countryId);
    };

    // 공항 클릭 시 선택된 공항 설정
    const handleAirportClick = (airportIso) => {
        const airport = airports.find(airport => airport.airportIso === airportIso);
        setSelectedAirport(airport);
    };

    // 나라 추가
    const addCountry = async () => {
        if (!countryIsoInput) {
            alert('Warning','ISO 코드를 입력해주세요.','warning');
            return;
        }

        const isoCodePattern = /^[A-Za-z]{2}$/;
        if (!isoCodePattern.test(countryIsoInput)) {
            alert('Info','ISO 코드는 두 글자의 영문자입니다.','info');
            setCountryIsoInput('');
            return;
        }

        const existingCountry = countrys.find(country => country.countryIso === countryIsoInput);
        if (existingCountry) {
            alert('Warning',`${existingCountry.countryName}는 이미 존재합니다.`,'warning');
            setCountryIsoInput('');
            return;
        }

        try {
            const response = await getCountryInfo(countryIsoInput);
            const data = response.data[0];

            const extractedData = {
                countryId: data.countryId,
                countryIso: data.codeIso2Country,
                countryName: data.nameCountry,
            };

            const saveResponse = await axios.post(`${backUrl}/country/add`, extractedData, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (saveResponse.status === 200) {
                alert('Success',`${extractedData.countryName} 저장 성공.`,'success');
                await fetchCountries();
                setSelectedCountry(null);
            } else {
                alert('Error',`${extractedData.countryName} 저장 실패.`,'error');
            }

        } catch (error) {
            alert('Error','존재하지 않는 ISO 코드입니다.','error');
        } finally {
            setCountryIsoInput('');
        }
    };

    // 나라 삭제
    const deleteCountry = async (countryIso) => {
        if (!countryIso) {
            alert('Warning','삭제할 나라를 선택 해주세요.','warning');
            return;
        }

        try {
            const response = await axios.delete(`${backUrl}/country/delete/${countryIso}`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                alert('Delete',`${selectedCountry.countryName} 삭제 성공.`,'warning');
                await fetchCountries(); 
                setSelectedCountry(null);
                setAirport([]); 
            } else {
                window.alert('삭제 실패');
                alert('Error',`${selectedCountry.countryName} 삭제 실패.`,'error');
            }
        } catch (error) {
            alert('Error','삭제 중 오류가 발생했습니다.','error');
        }
    };

    // 공항 추가
    const addAirport = async () => {
        if (!airportIataInput || !selectedCountry) {
            alert('Warning',"IATA 코드와 선택한 나라를 입력해주세요.",'warning');
            return;
        }

        const existingAirport = airports.find(airport => airport.airportIso === airportIataInput);
        if (existingAirport) {
            alert('Warning',`${existingAirport.airportName}는 이미 존재합니다.`,'warning');
            setAirportIataInput('');
            return;
        }

        try {
            const response = await getAirportInfo2(airportIataInput, selectedCountry.countryIso);
            const data = response.data[0];

            if (!data) {
                alert('Error',"해당 IATA 코드에 대한 공항 정보를 찾을 수 없습니다.",'error');
                setAirportIataInput('');
                return;
            }

            const extractedData = {
                airportId: data.airportId,
                countryIso: data.codeIso2Country,
                airportName: data.nameAirport,
                airportIso: data.codeIataAirport,
                latitudeAirport: data.latitudeAirport,
                longitudeAirport: data.longitudeAirport,
                timezone: data.timezone,
                country: { id: selectedCountry.id },
            };

            const saveResponse = await axios.post(`${backUrl}/airport/add`, extractedData, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (saveResponse.status === 200) {
                alert('Success',`${extractedData.airportName} 저장 성공.`,'success');
                await fetchAirportsByCountry(selectedCountry.id);
            } else {
                window.alert('저장 실패');
            }

        } catch (error) {
            alert('Error',"데이터를 가져오거나 저장하는 중 오류가 발생했습니다.",'error');
        } finally {
            setAirportIataInput(''); 
        }
    };

    // 공항 삭제
    const deleteAirport = async (airportIso) => {
        if (!airportIso) {
            alert('Warning','삭제할 공항을 선택 해주세요.','warning');
            return;
        }

        try {
            const response = await axios.delete(`${backUrl}/airport/delete/${airportIso}`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                alert('Delete',`${selectedAirport.airportName} 삭제 성공.`,'warning');
                await fetchAirportsByCountry(selectedCountry.id); 
                setAirport(prev => prev.filter(airport => airport.airportIso !== airportIso));
            } else {
                alert('Error',`${selectedAirport.airportName} 삭제 실패.`,'error');
            }
        } catch (error) {
            alert('Error','삭제 중 오류가 발생했습니다.','error');
        }
    };

    return (
            <>
            <Header isMain={false}/>
            <div className={styles.allCon}>
                <div className={styles.countryInfo}>
                    <div className={styles.countryPlus}>
                        <Input
                            id={styles.countryInput}
                            type="text"
                            placeholder="나라 ISO 코드 입력"
                            name="countryIso"
                            value={countryIsoInput}
                            onChange={(e) => setCountryIsoInput(e.target.value)}
                        />
                        <Button onClick={addCountry} id={styles.countryButton}>Add</Button>
                    </div>

                    <div className={styles.countryList}>
                        {countrys.map(country => (
                            <div
                                key={country.countryId}
                                className={selectedCountry && selectedCountry.countryIso === country.countryIso 
                                    ? `${styles.countryDetails} ${styles.active}` 
                                    : styles.countryDetails
                                }
                                onClick={() => handleCountryClick(country.id)}
                            >
                                <div className={styles.cn}>{country.countryName}</div>
                            </div>
                        ))}
                    </div>

                    {selectedCountry && (
                        <img 
                            src={Delete} 
                            id={styles.delCountryIcon} 
                            alt="Delete Country" 
                            onClick={() => deleteCountry(selectedCountry.countryIso)} 
                        />
                    )}
                </div>

                <div className={styles.airportInfo}>
                    <div className={styles.airportPlus}>
                        <Input
                            id={styles.airportInput}
                            type="text"
                            placeholder='공항 Iata 코드 입력'
                            _placeholder={{ opacity: 1, color: 'black.500' }}
                            name="airportIata"
                            value={airportIataInput}
                            onChange={(e) => setAirportIataInput(e.target.value)}
                        />
                        <Button onClick={addAirport} id={styles.airportButton}>Add</Button>
                    </div>

                    <div className={styles.lataBox}>
                        {airports.length > 0 ? (
                            airports.map(airport => (
                                <div
                                    key={airport.airportId}
                                    className={selectedAirport && selectedAirport.airportIso === airport.airportIso 
                                        ? `${styles.ai} ${styles.active}`
                                        : styles.ai
                                    }
                                    onClick={() => handleAirportClick(airport.airportIso)}
                                >
                                    {airport.airportIso}
                                </div>
                            ))
                        ) : (
                            <img 
                                src={Airport} 
                                id={styles.airportIMG} 
                                alt="airport Icon" 
                            />
                        )}
                    </div>

                    
                    {selectedAirport ? (
                        <div className={styles.airportDetails}>
                            <div className={styles.airName}>{selectedAirport.airportName}</div>
                            <table className={styles.airportTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.tableHeader}>Airport Iata Code</td>
                                        <td className={styles.tdd}>{selectedAirport.airportIso}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.tableHeader}>Airport Id</td>
                                        <td className={styles.tdd}>{selectedAirport.airportId}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.tableHeader}>Airport Latitude</td>
                                        <td className={styles.tdd}>{selectedAirport.latitudeAirport}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.tableHeader}>Airport Longitude</td>
                                        <td className={styles.tdd}>{selectedAirport.longitudeAirport}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <img 
                                src={Delete} 
                                id={styles.delAirportIcon} 
                                alt="Delete Airport" 
                                onClick={() => deleteAirport(selectedAirport.airportIso)} 
                            />
                        </div>
                    ) : (
                        <div className={styles.airportDetailText}>
                            <p>공항을 추가해주세요</p>
                        </div>
                    )}

                    {/* <img 
                        src={Airplain}
                        id={styles.airplainIMG}
                    /> */}
                </div>
                <div id={styles.airplainIMG}/>
            </div>
        </>
    );
};

export default EditCA;