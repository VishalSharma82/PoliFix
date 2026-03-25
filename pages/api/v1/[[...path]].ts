// pages/api/v1/[[...path]].ts
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false, // Let Express handle the body
  },
}

export default async function handler(req: any, res: any) {
  try {
    const { default: app } = await import("../../../server/index");
    console.log('--- PAGES API V1 CALLED ---', req.url);
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
