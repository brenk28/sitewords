import { createApp } from "../server/app";

let cachedApp: any = null;

// Create and export the Express app for Vercel
export default async (req: any, res: any) => {
  if (!cachedApp) {
    const { app } = await createApp();
    cachedApp = app;
  }
  return cachedApp(req, res);
};
