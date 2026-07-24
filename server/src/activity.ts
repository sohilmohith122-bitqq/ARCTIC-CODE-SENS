import axios from 'axios';

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  email: string;
  loginDate: Date;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: number;
  browser: string;
  operatingSystem: string;
  device: string;
  ipAddress: string;
  country: string;
  city: string;
  timeZone: string;
  loginStatus: 'success' | 'failed';
  failureReason?: string;
}

/**
 * Parse user agent to extract browser and OS information
 */
export function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';

  return { browser, os, device };
}

/**
 * Get geolocation from IP address
 */
export async function getGeolocation(ipAddress: string): Promise<{ country: string; city: string; timeZone: string }> {
  try {
    // Using ip-api.com (free tier available)
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);

    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        city: response.data.city || 'Unknown',
        timeZone: response.data.timezone || 'UTC',
      };
    }
  } catch (error) {
    console.error('Geolocation lookup failed:', error);
  }

  return {
    country: 'Unknown',
    city: 'Unknown',
    timeZone: 'UTC',
  };
}

/**
 * Extract IP address from request
 */
export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    'Unknown'
  );
}

/**
 * Create login activity record
 */
export async function createLoginActivity(
  userId: string,
  userName: string,
  email: string,
  userAgent: string,
  ipAddress: string,
  loginStatus: 'success' | 'failed',
  failureReason?: string
): Promise<LoginActivity> {
  const { browser, os, device } = parseUserAgent(userAgent);
  const { country, city, timeZone } = await getGeolocation(ipAddress);
  const now = new Date();

  return {
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    userName,
    email,
    loginDate: now,
    loginTime: now.toISOString(),
    browser,
    operatingSystem: os,
    device,
    ipAddress,
    country,
    city,
    timeZone,
    loginStatus,
    failureReason,
  };
}

/**
 * Update logout time and calculate session duration
 */
export function updateLogoutActivity(activity: LoginActivity, logoutTime: Date): LoginActivity {
  const loginDate = new Date(activity.loginTime);
  const sessionDuration = Math.floor((logoutTime.getTime() - loginDate.getTime()) / 1000); // in seconds

  return {
    ...activity,
    logoutTime: logoutTime.toISOString(),
    sessionDuration,
  };
}
