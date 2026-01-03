import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  const confirm = (msg, onConfirm) => {
    setMessage(msg);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
    setOnConfirmCallback(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  };

  return {
    isOpen,
    message,
    confirm,
    handleConfirm,
    handleCancel
  };
};

