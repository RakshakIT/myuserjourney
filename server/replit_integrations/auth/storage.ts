import { users } from "@shared/schema";
import type { UpsertUser } from "@shared/models/auth";
import type { User } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = await this.getUser(userData.id);
    if (existing) {
      const [user] = await db
        .update(users)
        .set({
          email: userData.email || existing.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    }

    const username = userData.email?.split("@")[0] || `user_${userData.id.slice(0, 8)}`;
    let uniqueUsername = username;
    let counter = 1;
    while (true) {
      const [existingUser] = await db.select().from(users).where(eq(users.username, uniqueUsername));
      if (!existingUser) break;
      uniqueUsername = `${username}${counter}`;
      counter++;
    }

    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        username: uniqueUsername,
        email: userData.email || `${userData.id}@noemail.local`,
        password: "",
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: "user",
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
