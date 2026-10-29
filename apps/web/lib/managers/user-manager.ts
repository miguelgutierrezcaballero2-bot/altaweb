/**
 * UserManager — Singleton in-memory CRUD for User entities
 */

import type { User, CreateUserInput, UpdateUserInput, AuthenticateUserInput, AuthenticateUserResult, Address } from '../types/user';

class UserManager {
  private static instance: UserManager;
  private users: Map<string, User> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  /** Create a new user */
  public create(input: CreateUserInput): User {
    const now = new Date();
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      email: input.email,
      password: input.password, // In production, this should be hashed
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      address: input.address ?? [],
      role: input.role ?? 'customer',
      isActive: input.isActive ?? true,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  /** Find a user by email */
  public findByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  /** Find a user by ID */
  public findById(id: string): User | undefined {
    return this.users.get(id);
  }

  /** Get all users */
  public findAll(): User[] {
    return Array.from(this.users.values());
  }

  /** Update a user by ID */
  public update(id: string, input: UpdateUserInput): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      ...input,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  /** Update a user's password */
  public updatePassword(id: string, newPassword: string): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      password: newPassword, // In production, this should be hashed
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  /** Delete a user by ID */
  public delete(id: string): boolean {
    return this.users.delete(id);
  }

  /** Authenticate a user by email and password */
  public authenticate(input: AuthenticateUserInput): AuthenticateUserResult | undefined {
    const user = this.findByEmail(input.email);
    if (!user || user.password !== input.password) return undefined;
    if (!user.isActive) return undefined;

    // Update last login
    user.lastLogin = new Date();
    this.users.set(user.id, user);

    const token = `token_${user.id}_${Date.now()}`;
    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }
}

export const userManager = UserManager.getInstance();
