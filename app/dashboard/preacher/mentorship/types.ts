
export interface Request {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  requestDate: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'essential';
}