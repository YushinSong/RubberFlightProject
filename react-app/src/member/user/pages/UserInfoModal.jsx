import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, Text, Flex, FormControl,
  FormLabel, Image, Box, Select
} from '@chakra-ui/react';
import { useUser } from '../../../general/user/contexts/LoginContextProvider';
import Swal from 'sweetalert2';
import styles from "../CSS/UserInfoModal.module.css";
import PasswordChangeModal from './PasswordChangeModal';

const UserInfoModal = ({ isOpen, onClose }) => {
  const { userInfo, loginCheck } = useUser();
  const backUrl = process.env.REACT_APP_BACK_URL;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailDomain: 'naver.com',
    tel1: '',
    tel2: '',
    tel3: '',
    image: null,
    existingImage: ''
  });
  const [isPasswordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (isOpen && userInfo.id) {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`${backUrl}/mypage/${userInfo.id}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email ? data.email.split('@')[0] : '',
            emailDomain: data.email ? data.email.split('@')[1] : 'naver.com',
            tel1: data.tel ? data.tel.split('-')[0] : '',
            tel2: data.tel ? data.tel.split('-')[1] : '',
            tel3: data.tel ? data.tel.split('-')[2] : '',
            image: null,
            existingImage: data.image || ''
          });
        } catch (error) {
          console.error('유저 정보를 가져오는 데 실패했습니다:', error);
        }
      };
      fetchUserInfo();
    }
  }, [isOpen, userInfo.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file
    }));
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', `${formData.email}@${formData.emailDomain}`);
      formDataToSend.append('tel', `${formData.tel1}-${formData.tel2}-${formData.tel3}`);
      
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      } else if (formData.existingImage) {
        formDataToSend.append('existingImage', formData.existingImage);
      }

      const response = await fetch(`${backUrl}/mypage/update/${userInfo.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('응답을 JSON으로 파싱하는 데 실패했습니다:', e);
        throw new Error('응답이 JSON 형식이 아닙니다.');
      }
      
      Swal.fire({
        title: "수정 완료",
        text: "회원정보를 성공적으로 수정하였습니다.",
        icon: "success",
        confirmButtonText: "확인",
        backdrop: true,
      }).then(() => {
        window.location.reload();
      });

      // console.log(data);
      await loginCheck();
      onClose();
    } catch (error) {
      console.error('유저 정보 수정 실패:', error);
    }
  };

  const handleOpenPasswordChangeModal = () => {
    onClose();
    setPasswordChangeModalOpen(true);
  };

  const handleClosePasswordChangeModal = () => {
    setPasswordChangeModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="#ffffff" borderRadius="md" boxShadow="lg">
          <ModalHeader fontSize="30px" fontWeight="bold" className={styles.modalTitle}>회원 정보 수정</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" p={4} maxWidth="500px" mx="auto">

              <FormControl id="profileImage" mb={4}>
                <FormLabel fontWeight="medium">프로필 사진:</FormLabel>
                <Box onClick={handleImageClick} mb={2} textAlign="center">
                  {formData.existingImage && !formData.image && (
                    <Image src={formData.existingImage} alt="Existing Profile" boxSize="150px" objectFit="cover" cursor="pointer" display="inline-block" />
                  )}
                  {formData.image && (
                    <Image src={URL.createObjectURL(formData.image)} alt="Selected Profile" boxSize="100px" objectFit="cover" display="inline-block" />
                  )}
                </Box>
                <Input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              </FormControl>

              <FormControl id="name" mb={4}>
                <FormLabel fontWeight="medium">이름:</FormLabel>
                <Input name="name" value={formData.name} onChange={handleChange} bg="white" className={styles.input} />
              </FormControl>
      
              <FormControl id="email" mb={4}>
                <FormLabel fontWeight="medium">이메일:</FormLabel>
                <Box display="flex" alignItems="center">
                  <Input name="email" value={formData.email} onChange={handleChange} bg="white" borderColor="#d1d1d1" className={styles.input} />
                  @
                  <Select name="emailDomain" value={formData.emailDomain} onChange={handleChange} bg="white" borderColor="#d1d1d1" ml={2} className={styles.input}>
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="nate.com">nate.com</option>
                    <option value="yahoo.com">yahoo.com</option>
                    <option value="hotmail.com">hotmail.com</option>
                    <option value="daum.net">daum.net</option>
                  </Select>
                </Box>
              </FormControl>
      
              <FormControl id="tel" mb={4}>
                <FormLabel fontWeight="medium">전화번호:</FormLabel>
                <Flex>
                  <Input name="tel1" value={formData.tel1} onChange={handleChange} maxLength="3" bg="white" borderColor="#d1d1d1" className={styles.input} />
                  -
                  <Input name="tel2" value={formData.tel2} onChange={handleChange} maxLength="4" bg="white" borderColor="#d1d1d1" ml={2} className={styles.input} />
                  -
                  <Input name="tel3" value={formData.tel3} onChange={handleChange} maxLength="4" bg="white" borderColor="#d1d1d1" ml={2} className={styles.input} />
                </Flex>
              </FormControl>
      
            </Flex>
          </ModalBody>


          <ModalFooter>
  <Flex justify="space-between" width="100%" align="center">
    <Button
      variant="outline"
      ml={3}
      onClick={handleOpenPasswordChangeModal}
      className={styles.passwordButton}
    >
      비밀번호 변경
    </Button>

    <Flex>
      <Button
        colorScheme="blue"
        mr={3}
        onClick={handleSave}
        className={styles.saveButton}
      >
        저장
      </Button>
      <Button variant="outline" onClick={onClose}>
        취소
      </Button>
    </Flex>
  </Flex>
</ModalFooter>


        </ModalContent>
      </Modal>

      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={handleClosePasswordChangeModal}
      />
    </>
  );
};

export default UserInfoModal;