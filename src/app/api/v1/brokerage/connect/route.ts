import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import {
  registerUser,
  deleteUser,
  getConnectionLink,
  isSnapTradeConfigured,
} from '@/lib/brokerage/snaptrade';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'brilliontly-dev-secret-change-in-production'
);

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('brilliontly-token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string, email: payload.email as string };
  } catch {
    return null;
  }
}

// POST /api/v1/brokerage/connect - Register user with SnapTrade and get connection URL
export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  if (!isSnapTradeConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'SnapTrade is not configured. Add SNAPTRADE_CLIENT_ID and SNAPTRADE_CONSUMER_KEY to your environment variables.',
      setup: {
        step1: 'Go to https://dashboard.snaptrade.com and create a free account',
        step2: 'Copy your Client ID and Consumer Key',
        step3: 'Add them as environment variables (Vercel or .env.local)',
      },
    }, { status: 503 });
  }

  try {
    // Register user with SnapTrade
    let userSecret: string;
    try {
      const registration = await registerUser(user.userId);
      userSecret = registration.userSecret!;
    } catch (err: unknown) {
      // User already exists — delete and re-register to get a fresh secret
      const error = err as { status?: number; body?: { detail?: string }; message?: string };
      if (error?.status === 400 || error?.body?.detail?.includes('already') || error?.message?.includes('already')) {
        try {
          await deleteUser(user.userId);
        } catch {
          // Delete might fail if user doesn't exist on their end, that's fine
        }
        const registration = await registerUser(user.userId);
        userSecret = registration.userSecret!;
      } else {
        throw err;
      }
    }

    // Generate the connection portal URL
    const loginData = await getConnectionLink(user.userId, userSecret) as Record<string, unknown>;

    // The SDK returns either redirectURI or loginRedirectURI depending on version
    const redirectUrl = loginData.redirectURI || loginData.loginRedirectURI || loginData.redirect_uri;

    if (!redirectUrl) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get redirect URL from SnapTrade',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        redirectUrl,
        userSecret, // Client stores this for future API calls
      },
    });
  } catch (error: unknown) {
    console.error('SnapTrade connect error:', error);
    const err = error as { message?: string; status?: number; body?: unknown };
    const errMsg = err?.message || 'Failed to create brokerage connection';
    const detail = err?.body ? JSON.stringify(err.body) : undefined;
    return NextResponse.json(
      { success: false, error: errMsg, detail },
      { status: 500 }
    );
  }
}

// GET /api/v1/brokerage/connect - Check if SnapTrade is configured
export async function GET() {
  return NextResponse.json({
    success: true,
    configured: isSnapTradeConfigured(),
    provider: 'SnapTrade',
    supportedBrokerages: [
      'Fidelity', 'Robinhood', 'Charles Schwab', 'Vanguard', 'TD Ameritrade',
      'E*TRADE', 'Interactive Brokers', 'Webull', 'Ally Invest', 'Merrill Edge',
      'JP Morgan', 'Wealthfront', 'Betterment', 'and 100+ more',
    ],
    freeTier: '5 connections, read-only, daily refresh',
  });
}
