export type NotificationType = 'new' | 'accepted' | 'rejected';

export type NotificationPayload = {
  type: NotificationType;
  skillName: string;
  fromUser: string;
};
