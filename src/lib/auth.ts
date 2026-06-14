import db from "./db";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_user_id")?.value;

  if (!userId) {
    // Return a default "OWNER" for testing if no cookie is set, 
    // but try to find the real owner in DB first
    const owner = await db.user.findFirst({ where: { role: "OWNER" } });
    if (owner) {
      return {
        user: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: owner.role as Role,
          image: owner.image,
        }
      };
    }
    
    // Fallback if DB is empty
    return {
      user: {
        id: "mock-owner-id",
        name: "Gym Owner (Demo)",
        email: "owner@fatgym.com",
        role: "OWNER" as Role,
        image: null,
      }
    };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      image: user.image,
    }
  };
}

export async function login(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { success: false, error: "User not found" };

  const cookieStore = await cookies();
  cookieStore.set("auth_user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return { success: true, user };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_user_id");
}
