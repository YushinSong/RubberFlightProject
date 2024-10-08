import React from 'react';
import { InputGroup, Input, InputRightElement, Button, Select, FormControl, FormLabel, Box, Flex, Text, Image } from '@chakra-ui/react';
import CustomFileInput from '../Join/CustomFileInput';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './JoinForm.module.css';

const PasswordInput = ({ placeholder, name, value, onChange, onBlur }) => {
    const [show, setShow] = React.useState(false);
    const handleClick = () => setShow(!show);

    return (
        <InputGroup size='md'>
            <Input
                pr='4.5rem'
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                backgroundColor={'white'}
                fontFamily='system-ui, sans-serif !important'
                textAlign={'left'}
                fontSize={'18px !important'}
                className={styles.input}
            />
            <InputRightElement width='4.5rem'>
                <Button h='1.75rem' size='sm' onClick={handleClick} bg={'#586D92'} color={'white'}>
                    {show ? 'Hide' : 'Show'}
                </Button>
            </InputRightElement>
        </InputGroup>
    );
};

const JoinForm = ({ join }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [emailDomain, setEmailDomain] = React.useState('naver.com');
    const [tel1, setTel1] = React.useState('');
    const [tel2, setTel2] = React.useState('');
    const [tel3, setTel3] = React.useState('');
    const [profileImage, setProfileImage] = React.useState(`${process.env.REACT_APP_BACK_URL}/uploads/user.png`); // Default profile image URL
    const [isUsernameVerified, setIsUsernameVerified] = React.useState(false);

    const backUrl = process.env.REACT_APP_BACK_URL;
    const navigate = useNavigate(); 

    // Handlers
    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleEmailDomainChange = (e) => setEmailDomain(e.target.value);
    const handleTel1Change = (e) => setTel1(e.target.value);
    const handleTel2Change = (e) => setTel2(e.target.value);
    const handleTel3Change = (e) => setTel3(e.target.value);

    // File input change handler
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const checkUsername = async () => {
        if (!username) {
            Swal.fire({
                icon: 'error',
                title: '아이디 입력 필요',
                text: '아이디를 입력해 주세요.',
            });
            return;
        }

        try {
            const response = await axios.post(`${backUrl}/user/check-username`, { username });
            if (response.data.exists) {
                Swal.fire({
                    icon: 'error',
                    title: '중복된 아이디입니다.',
                    text: '다른 아이디를 사용해주세요.',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: '사용가능한 아이디입니다.',
                    text: '회원가입을 진행해주세요.',
                });
                setIsUsernameVerified(true);
            }
        } catch (error) {
            console.error('Error checking username:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while checking the username.',
            });
        }
    };

    const onJoin = async (e) => {
        e.preventDefault();

        const fullEmail = `${email}@${emailDomain}`; 
        const fullTel = `${tel1}-${tel2}-${tel3}`;

        // 유효성 검사 추가 

        if (!isUsernameVerified) {
            Swal.fire({
                icon: 'error',
                title: '아이디 중복 확인 필요',
                text: '아이디 중복 확인을 먼저 해주세요.',
            });
            return;
        }

        if (!username) {
            Swal.fire({
                icon: 'error',
                title: '아이디를 입력하지 않았습니다.',
                text: '아이디를 입력해 주세요.',
            });
            return;
        }
    
        if (!password) {
            Swal.fire({
                icon: 'error',
                title: '비밀번호를 입력하지 않았습니다.',
                text: '비밀번호를 입력해 주세요.',
            });
            return;
        }
    
        if (!confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: '비밀번호 확인을 입력하지 않았습니다.',
                text: '비밀번호 확인을 입력해 주세요.',
            });
            return;
        }
    
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: '비밀번호가 일치하지 않습니다.',
                text: '비밀번호와 비밀번호 확인이 다릅니다.',
            });
            return;
        }
    
        if (!name) {
            Swal.fire({
                icon: 'error',
                title: '이름을 입력하지 않았습니다.',
                text: '이름을 입력해 주세요.',
            });
            return;
        }
    
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: '이메일을 입력하지 않았습니다.',
                text: '이메일을 입력해 주세요.',
            });
            return;
        }
    
        if (!emailDomain) {
            Swal.fire({
                icon: 'error',
                title: '이메일 도메인을 선택하지 않았습니다.',
                text: '이메일 도메인을 선택해 주세요.',
            });
            return;
        }
    
        const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(fullEmail)) {
            Swal.fire({
                icon: 'error',
                title: '이메일 형식 오류',
                text: '유효한 이메일 주소를 입력해 주세요.',
            });
            return;
        }
    
        // Validation for telephone number
        if (!tel1 || !tel2 || !tel3) {
            Swal.fire({
                icon: 'error',
                title: '전화번호를 입력하지 않았습니다.',
                text: '전화번호를 입력해 주세요.',
            });
            return;
        }

        const telRegex = /^\d{3}-\d{4}-\d{4}$/;
        if (!telRegex.test(fullTel)) {
            Swal.fire({
                icon: 'error',
                title: '전화번호 형식 오류',
                text: '전화번호를 올바른 형식으로 입력해 주세요.',
            });
            return;
        }

        // Form data preparation
        const formData = new FormData(e.target);
        formData.delete('email');
        formData.delete('emailDomain');
        formData.append('email', fullEmail);

        formData.delete('tel1');
        formData.delete('tel2');
        formData.delete('tel3');
        formData.append('tel', fullTel);

        // Append profile image if selected
        const fileInput = e.target.querySelector('input[name="file"]');
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            await join(formData);
            Swal.fire({
                icon: 'success',
                title: '회원가입 성공',
                text: '로그인페이지로 이동합니다.',
            });
        } catch (error) {
            console.error('Join request failed:', error);
            Swal.fire({
                icon: 'error',
                title: '회원가입 실패',
                text: '잠시후 다시 시도해주세요.',
            });
        }

        e.target.reset();
        setIsUsernameVerified(false);
    };

    const home = () => {
        navigate("/");
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 100
                }}
            >
                <div className={styles.homeBtn}
                    // style={{
                    //     backgroundImage: 'url(../../../../../assets/images/main/logo.webp)',
                    //     backgroundSize: 'cover',
                    //     backgroundPosition: 'center center',
                    //     width: '75px',
                    //     height: '75px',
                    //     cursor: 'pointer'
                    // }}
                    onClick={home}
                ></div>
            </div>
            <Box className="form" maxWidth="480px" mx="auto" p={6} bg="#ffffff" borderRadius="md" boxShadow="md" padding={10} marginBottom="80px">
                <h2 className="login-title" style={{ textAlign: 'center', fontSize: '33px' }}>회원가입</h2>
                <br />
                <form className="login-form" onSubmit={onJoin}>
                    <FormControl id="join-profile-image" mb={4}>
                        <FormLabel>프로필 이미지</FormLabel>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <Image
                                src={profileImage}
                                alt="Profile"
                                boxSize="150px"
                                borderRadius="full"
                                objectFit="cover"
                                cursor="pointer"
                                onClick={() => document.getElementById('file-input').click()}
                            />
                            <Input
                                id="file-input"
                                type="file"
                                name="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                display="none"
                            />
                        </Box>
                    </FormControl>

                    <FormControl id="join-username" mb={4}>
                        <FormLabel>아이디 <Text as="span" color="red">*</Text></FormLabel>
                        <Flex>
                            <Input
                                className={styles.input}
                                type="text"
                                placeholder="Username"
                                name="username"
                                value={username}
                                onChange={handleUsernameChange}
                                autoComplete="username"
                                backgroundColor={'white'}
                            />
                            <Button
                                ml={2}
                                bg="#ed8585"
                                color="white"
                                _hover={{ bg: "#f59e9e" }}
                                _active={{ bg: "#ed8585" }}
                                onClick={checkUsername}
                            >
                                중복 확인
                            </Button>
                        </Flex>
                    </FormControl>
                    <FormControl id="join-password" mb={4}>
                        <FormLabel>비밀번호 <Text as="span" color="red">*</Text></FormLabel>
                        <PasswordInput
                            className={styles.input}
                            placeholder="Enter password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </FormControl>

                    <FormControl id="join-confirm-password" mb={4}>
                        <FormLabel> 비밀번호 확인 <Text as="span" color="red">*</Text></FormLabel>
                        <PasswordInput
                            className={styles.input}
                            placeholder="Confirm password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                        />
                    </FormControl>

                    <FormControl id="join-name" mb={4}>
                        <FormLabel>이름 <Text as="span" color="red">*</Text></FormLabel>
                        <Input
                            className={styles.input}
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={name}
                            onChange={handleNameChange}
                            autoComplete="name"
                            backgroundColor={'white'}
                        />
                    </FormControl>

                    <FormControl id="join-email-section" mb={4}>
                        <FormLabel>이메일 <Text as="span" color="red">*</Text></FormLabel>
                        <Box display="flex" alignItems="center">
                            <Input
                                className={styles.input}
                                type="text"
                                placeholder="Email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                autoComplete="email"
                                mr={2}
                                backgroundColor={'white'}
                                id="join-email-input"
                            />
                            @
                            <Select
                                className={styles.input}
                                name="emailDomain"
                                value={emailDomain}
                                onChange={handleEmailDomainChange}
                                ml={2}
                                backgroundColor={'white'}
                                id="join-email-domain"
                            >
                                <option value="naver.com" className={styles.input}>naver.com</option>
                                <option value="gmail.com" className={styles.input}>gmail.com</option>
                                <option value="hanmail.net" className={styles.input}>hanmail.net</option>
                                <option value="nate.com" className={styles.input}>nate.com</option>
                                <option value="yahoo.com" className={styles.input}>yahoo.com</option>
                                <option value="hotmail.com" className={styles.input}>hotmail.com</option>
                                <option value="daum.net" className={styles.input}>daum.net</option>
                            </Select>
                        </Box>
                    </FormControl>

                    <FormControl id="join-tel-section" mb={4}>
                        <FormLabel>전화번호 <Text as="span" color="red">*</Text></FormLabel>
                        <Flex>
                            <Input
                                className={styles.input}
                                type="text"
                                placeholder=""
                                name="tel1"
                                value={tel1}
                                onChange={handleTel1Change}
                                maxLength="3"
                                backgroundColor={'white'}
                                id="join-tel1"
                            />
                            -
                            <Input
                                className={styles.input}
                                type="text"
                                placeholder=""
                                name="tel2"
                                value={tel2}
                                onChange={handleTel2Change}
                                maxLength="4"
                                ml={2}
                                backgroundColor={'white'}
                                id="join-tel2"
                            />
                            -
                            <Input
                                className={styles.input}
                                type="text"
                                placeholder=""
                                name="tel3"
                                value={tel3}
                                onChange={handleTel3Change}
                                maxLength="4"
                                ml={2}
                                backgroundColor={'white'}
                                id="join-tel3"
                            />
                        </Flex>
                    </FormControl>

                    <br />

                    <Button
                        type="submit"
                        bg="#586D92"
                        color="white"
                        width={'100%'}
                        _hover={{ bg: "#4a5b71" }}
                        _active={{ bg: "#586D92" }}
                    >
                        Sign Up
                    </Button>
                </form>
            </Box>
        </>
    );
};

export default JoinForm;