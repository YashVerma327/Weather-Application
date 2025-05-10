import { users, savedLocations, weatherAlerts } from "@shared/schema";
import type { 
  User, InsertUser, 
  SavedLocation, InsertSavedLocation,
  WeatherAlert, InsertWeatherAlert 
} from "@shared/schema";
import session from "express-session";
import { eq } from 'drizzle-orm';
import connectPg from "connect-pg-simple";

// Import only from one place to avoid duplicate identifier errors
import { db, pool } from './db-local';

// Fix the SessionStore type issue
const PostgresSessionStore = connectPg(session);

// Define the store interface properly
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Saved locations operations
  getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]>;
  getSavedLocationById(id: number): Promise<SavedLocation | undefined>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  deleteSavedLocation(id: number): Promise<boolean>;
  
  // Weather alerts operations
  getWeatherAlertsByUserId(userId: number): Promise<WeatherAlert[]>;
  getWeatherAlertById(id: number): Promise<WeatherAlert | undefined>;
  createWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  updateWeatherAlert(id: number, enabled: boolean): Promise<WeatherAlert | undefined>;
  deleteWeatherAlert(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Change from session.SessionStore to any
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Change the type here too

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Rest of the code remains the same...
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Saved locations operations
  async getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]> {
    return db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
  }

  async getSavedLocationById(id: number): Promise<SavedLocation | undefined> {
    const [location] = await db.select().from(savedLocations).where(eq(savedLocations.id, id));
    return location || undefined;
  }

  async createSavedLocation(insertLocation: InsertSavedLocation): Promise<SavedLocation> {
    const [location] = await db
      .insert(savedLocations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async deleteSavedLocation(id: number): Promise<boolean> {
    const result = await db
      .delete(savedLocations)
      .where(eq(savedLocations.id, id))
      .returning({ id: savedLocations.id });
    return result.length > 0;
  }

  // Weather alerts operations
  async getWeatherAlertsByUserId(userId: number): Promise<WeatherAlert[]> {
    return db.select().from(weatherAlerts).where(eq(weatherAlerts.userId, userId));
  }

  async getWeatherAlertById(id: number): Promise<WeatherAlert | undefined> {
    const [alert] = await db.select().from(weatherAlerts).where(eq(weatherAlerts.id, id));
    return alert || undefined;
  }

  async createWeatherAlert(insertAlert: InsertWeatherAlert): Promise<WeatherAlert> {
    const [alert] = await db
      .insert(weatherAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async updateWeatherAlert(id: number, enabled: boolean): Promise<WeatherAlert | undefined> {
    const [alert] = await db
      .update(weatherAlerts)
      .set({ enabled })
      .where(eq(weatherAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  async deleteWeatherAlert(id: number): Promise<boolean> {
    const result = await db
      .delete(weatherAlerts)
      .where(eq(weatherAlerts.id, id))
      .returning({ id: weatherAlerts.id });
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();