import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, Input, Stack, useToast, Flex, css, Icon } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import { MdPerson, MdLock } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/LoginContextProvider';
import styles from './loginForm.module.css';

const LoginForm = () => {
  const { login } = useContext(LoginContext);
  const [rememberUserId, setRememberUserId] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const backUrl = process.env.REACT_APP_BACK_URL;

  const home = () => {
    navigate("/");
  }

  const onLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const rememberId = e.target.rememberId.checked;

    login(username, password, rememberId);
  };

  useEffect(() => {
    const rememberId = Cookies.get('rememberId');
    setRememberUserId(rememberId || '');
    document.body.style.overflowY = 'scroll';
  }, []);

  return (
    // 배경
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
      p={4}
      backgroundColor="#ffffff"
    >

      {/* 이미지 */}
      <Box className={styles.Logo} onClick={home} cursor="pointer"/>  

      {/* 로그인 배경 */}
      <Flex
      direction="column"
      padding="20px"
      borderRadius="10px"
      backgroundColor="#fffff"
      // borderLeft="2px solid #3c3570"
      // borderRight="2px solid #3c3570"
      borderTop="3px solid #3c3570"
      borderBottom="3px solid #5aa7e1"
      boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
      >

      {/* 로그인 텍스트 */}
      {/* <Box mb={2} textAlign="center">
        <h1 style={{ 
          fontSize: '25px', 
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif'
          }}>Login</h1>
      </Box> */}

        <Box p={4}
        >
          <form onSubmit={(e) => onLogin(e)}>
            <Stack spacing={4}>
              <FormControl id="username">
                <FormLabel>
                <HStack spacing={2} align="center">
                  <Icon as={MdPerson} color="black" boxSize={5} />
                  <span  className={styles.subjectCustom}>Username</span>
                </HStack></FormLabel>
                <Input
                  type="text"
                  placeholder="Username"
                  name="username"
                  autoComplete="off"
                  defaultValue={rememberUserId}
                  className={styles.inputCustom}
                />
              </FormControl>

                <FormControl id="password">
                  <FormLabel>
                    <HStack spacing={2} align="center">
                     <Icon as={MdLock} color="black" boxSize={5} />
                     <span className={styles.subjectCustom}>Password</span>
                    </HStack>
                  </FormLabel>
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  autoComplete="off"
                  className={styles.inputCustom}
                />
              </FormControl>

              <FormControl>
                <Stack direction="row" align="center">
                  <Checkbox
                  id="remember-id" 
                  name="rememberId" 
                  defaultChecked={!!rememberUserId}
                  sx={{
                    '& .chakra-checkbox__control': {
                      backgroundColor: 'white', 
                    },
                    '& .chakra-checkbox__control[data-checked]': {
                      backgroundColor: 'blue.500', 
                    },
                  }}
                  colorScheme='blue'
                  > <p className={styles.subjectCustom}>Remember me</p>
                  </Checkbox>
                </Stack>
              </FormControl>

              <hr />
              <div>
                <h4 style={{ fontWeight: '500' , fontFamily:'system-ui, sans-serif'}}>
                  Log in using your account on 
                  </h4>
              </div>

              {/* 소셜 로그인 버튼 부분 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                {/* 구글 로그인 */}
                <div className={styles.google}
                  style={{
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.location.href = `${backUrl}/authorization/google`;
                  }}
                />

                {/* 카카오 로그인 */}
                <div className={styles.kakao}
                  style={{
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.location.href = `${backUrl}/oauth2/authorization/kakao`;
                  }}
                />

                {/* 네이버 로그인 */}
                <div className={styles.naver}
                  style={{
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.location.href = `${backUrl}/oauth2/authorization/naver`;
                  }}
                />

                {/* 페이스북 로그인 */}
                <div className={styles.facebook}
                  style={{
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.location.href = `${backUrl}/oauth2/authorization/facebook`;
                  }}
                />
              </div>

              <HStack spacing={4} align="center" justify="right">
                <Button as={Link} to="/selectJoin" variant="link" color={'black'} fontFamily={'system-ui, sans-serif'}>
                  Join
                </Button>
                <Button 
                type="submit" 
                bg={'#f7f7f7'} 
                color={'black'} 
                borderBottom={'1px solid lightgrey'} 
                fontFamily={'system-ui, sans-serif'}
                _hover={{}}
                >
                  Login
                </Button>
              </HStack>
            </Stack>
          </form>
        </Box>
        </Flex>
    </Box>
  );
};

export default LoginForm;
