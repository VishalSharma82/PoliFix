export default async function handler(req: any, res: any) {
  try {
    console.log('Vercel API Handler invoked');
    // Dynamic import to catch potential startup errors in server/index.ts
    const { default: app } = await import("../server/index");
    return app(req, res);
  } catch (err: any) {
    console.error('SERVER STARTUP ERROR:', err);
    res.status(500).json({
      error: 'Server Startup Failed',
      message: err.message,
      stack: err.stack,
    });
  }
}
