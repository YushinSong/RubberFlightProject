import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, FormControl, FormLabel,
  InputRightElement,
  InputGroup,
  Text
} from '@chakra-ui/react';
import Swal from 'sweetalert2';
import { useUser } from '../../../general/user/contexts/LoginContextProvider';
import styles from '../CSS/UserInfoModal.module.css'

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
          // Set font-family to a sans-serif font
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

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const { userInfo } = useUser();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const backUrl = process.env.REACT_APP_BACK_URL;

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Swal.fire({
        title: "입력 오류",
        text: "새 비밀번호와 확인 비밀번호를 입력해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
        backdrop: true,
        willOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      });
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "비밀번호 불일치",
        text: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        icon: "error",
        confirmButtonText: "확인",
        backdrop: true,
        willOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      });
      return;
    }
  
    try {
      const response = await fetch(`${backUrl}/mypage/change-password/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
  
      Swal.fire({
        title: "비밀번호 변경 완료",
        text: "비밀번호가 성공적으로 변경되었습니다.",
        icon: "success",
        confirmButtonText: "확인",
        backdrop: true,
        willOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      }).then(() => {
        onClose();
      });
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      Swal.fire({
        title: "비밀번호 변경 실패",
        text: "비밀번호 변경에 실패했습니다. 다시 시도해 주세요.",
        icon: "error",
        confirmButtonText: "확인",
        backdrop: true,
        willOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      });
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent
        sx={{
          zIndex: '9999',
        }}
      >
        <ModalHeader className='passwordButton'>비밀번호 변경</ModalHeader>
        <Text className={styles.text}>새로운 비밀번호를 설정해보세요.</Text>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="newPassword" mb={4}>
            <FormLabel>새 비밀번호</FormLabel>
            <PasswordInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </FormControl>
          <FormControl id="confirmPassword" mb={4}>
            <FormLabel>새 비밀번호 확인</FormLabel>
            <PasswordInput type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleSave} className={styles.saveButton}>
            저장
          </Button>
          <Button variant="outline" onClick={onClose}>취소</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PasswordChangeModal;