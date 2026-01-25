import type { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      role: string;
      authProvider: string;
      isActive: boolean;
      subscriptionTier: string;
      subscriptionStatus: string;
      stripeCustomerId: string | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
      createdAt: Date;
      updatedAt: Date | null;
    }
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  if (process.env.ADMIN_EMAIL) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUser = await storage.getUserByEmail(adminEmail);
    if (adminUser && adminUser.role !== "admin") {
      await storage.updateUser(adminUser.id, { role: "admin" });
      console.log(`[Auth] Auto-promoted ${adminEmail} to admin role on startup`);
    }
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fallback-secret-change-me",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.isActive) {
            return done(null, false, { message: "Account has been deactivated" });
          }
          if (!user.password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            await storage.updateUser(user.id, { password: hashedPassword });
            console.log(`[Auth] Password set for user ${user.email} (first login after migration)`);
            const updatedUser = await storage.getUserByEmail(email);
            return done(null, updatedUser);
          }
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.warn("[Google OAuth] No email returned from Google profile");
              return done(null, false, { message: "No email from Google" });
            }
            console.log(`[Google OAuth] Attempting login for email: ${email}`);

            let user = await storage.getUserByEmail(email);
            if (user) {
              console.log(`[Google OAuth] Found existing user: ${user.email} (id: ${user.id}, role: ${user.role})`);
              if (!user.isActive) {
                return done(null, false, { message: "Account has been deactivated" });
              }
              const updated = await storage.updateUser(user.id, {
                firstName: profile.name?.givenName || user.firstName,
                lastName: profile.name?.familyName || user.lastName,
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
                authProvider: user.authProvider === "local" ? "local,google" : user.authProvider.includes("google") ? user.authProvider : `${user.authProvider},google`,
              });
              console.log(`[Google OAuth] User updated, role preserved: ${updated.role}`);
              return done(null, updated);
            }

            const username = email.split("@")[0];
            let uniqueUsername = username;
            let counter = 1;
            while (await storage.getUserByUsername(uniqueUsername)) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }

            user = await storage.createUser({
              username: uniqueUsername,
              email,
              password: "",
            });

            const updated = await storage.updateUser(user.id, {
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              authProvider: "google",
            });

            return done(null, updated);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const username = email.split("@")[0];
      let uniqueUsername = username;
      let counter = 1;
      while (await storage.getUserByUsername(uniqueUsername)) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      const user = await storage.createUser({
        username: uniqueUsername,
        email,
        password: hashedPassword,
      });

      if (firstName || lastName) {
        await storage.updateUser(user.id, {
          firstName: firstName || null,
          lastName: lastName || null,
          authProvider: "local",
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password: _, ...safeUser } = user as any;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.get("/api/auth/google", (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth is not configured" });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get(
    "/api/auth/google/callback",
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) {
          console.error("[Google OAuth] Error:", err.message || err);
          return res.redirect("/login?error=google_auth_error");
        }
        if (!user) {
          const msg = info?.message || "google_auth_failed";
          console.warn("[Google OAuth] Authentication failed:", msg);
          return res.redirect(`/login?error=${encodeURIComponent(msg)}`);
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("[Google OAuth] Session creation error:", loginErr);
            return res.redirect("/login?error=session_error");
          }
          console.log(`[Google OAuth] User logged in: ${user.email} (role: ${user.role})`);
          res.redirect("/");
        });
      })(req, res, next);
    }
  );

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password: _, ...safeUser } = req.user as any;
    res.json(safeUser);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.json({ message: "Logged out" });
      });
    });
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/landing");
      });
    });
  });

  app.get("/api/login", (_req: Request, res: Response) => {
    res.redirect("/login");
  });

  app.post("/api/auth/promote-admin", async (req: Request, res: Response) => {
    try {
      const { email, secret } = req.body;
      if (!email || !secret) {
        return res.status(400).json({ message: "Email and secret are required" });
      }
      if (secret !== process.env.SESSION_SECRET) {
        return res.status(403).json({ message: "Invalid secret" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.updateUser(user.id, { role: "admin" });
      console.log(`[Auth] User ${email} promoted to admin via bootstrap`);
      res.json({ message: `User ${email} promoted to admin` });
    } catch (err: any) {
      console.error("[Auth] Admin promotion error:", err);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      if (user.authProvider === "google" && !user.password) {
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.createPasswordReset(user.id, token, expiresAt);

      const smtpConfig = await storage.getSmtpSettings();
      if (smtpConfig && smtpConfig.isActive) {
        try {
          const siteConfig = await storage.getSiteSettings();
          const siteName = siteConfig?.siteName || "My User Journey";
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          const resetLink = `${baseUrl}/reset-password?token=${token}`;

          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.encryption === "ssl",
            auth: { user: smtpConfig.username, pass: smtpConfig.password },
          });

          await transporter.sendMail({
            from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
            to: email,
            subject: `Password Reset - ${siteName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your ${siteName} account.</p>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <p style="margin: 24px 0;">
                  <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
                </p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${resetLink}</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send password reset email:", emailErr);
        }
      }

      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const resetRecord = await storage.getPasswordResetByToken(token);
      if (!resetRecord) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }
      if (resetRecord.used) {
        return res.status(400).json({ message: "This reset link has already been used" });
      }
      if (new Date() > resetRecord.expiresAt) {
        return res.status(400).json({ message: "This reset link has expired" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.updateUser(resetRecord.userId, { password: hashedPassword } as any);
      await storage.markPasswordResetUsed(resetRecord.id);

      res.json({ message: "Password has been reset successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to reset password" });
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = req.user as any;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
