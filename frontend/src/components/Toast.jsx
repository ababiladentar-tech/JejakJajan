import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../context/store';

export default function Toast() {
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      const toastType = notification.type || 'success';
      const duration = notification.duration || 3000;

      toast[toastType](notification.message, {
        id: notification.id,
        duration,
      });

      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    });
  }, [notifications, removeNotification]);

  return null;
}
