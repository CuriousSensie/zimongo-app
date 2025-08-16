
export interface IUser {
    _id: string;
    email: string;
    password?: string; // Optional as it shouldn't always be sent to the client
    createdAt: Date;
  }
