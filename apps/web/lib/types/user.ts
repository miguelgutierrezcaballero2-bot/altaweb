/**
 * User — Customer/account management domain types
 */

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  phone: string | null;
  address: Address[];
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: Address[];
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  address?: Address[];
  role?: UserRole;
  isActive?: boolean;
}

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthenticateUserResult {
  user: Omit<User, 'password'>;
  token: string;
}
