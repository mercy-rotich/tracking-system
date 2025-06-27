
import { useState } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (data) => {
    setModalData(data);
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal
  };
};