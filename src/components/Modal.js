import React from 'react';
import {
  Modal as CModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth }) => {
  const contentMax = maxWidth || { base: '95vw', md: '720px' };
  return (
    <CModal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW={contentMax}>
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </CModal>
  );
};

export default Modal;