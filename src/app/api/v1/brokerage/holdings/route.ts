import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import {
  getAccounts,
  getHoldings,
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
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// GET /api/v1/brokerage/holdings - Get all holdings from connected brokerages
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  if (!isSnapTradeConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'SnapTrade is not configured',
    }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userSecret = searchParams.get('userSecret');

  if (!userSecret) {
    return NextResponse.json({
      success: false,
      error: 'userSecret is required. Store it from the /connect response.',
    }, { status: 400 });
  }

  try {
    // Get all connected accounts
    const accounts = await getAccounts(user.userId, userSecret);

    // Get all holdings across all accounts
    const holdings = await getHoldings(user.userId, userSecret);

    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts.map((a: Record<string, unknown>) => ({
          id: a.id,
          name: a.name,
          number: a.number,
          institutionName: a.institution_name,
          type: a.meta && typeof a.meta === 'object' && 'type' in a.meta ? (a.meta as Record<string, unknown>).type : 'unknown',
          syncStatus: a.sync_status,
        })),
        holdings: holdings.map((h: Record<string, unknown>) => {
          const account = h.account as Record<string, unknown> | undefined;
          const symbol = h.symbol as Record<string, unknown> | undefined;
          const symbolObj = symbol?.symbol as Record<string, unknown> | undefined;
          return {
            accountId: account?.id,
            accountName: account?.name,
            ticker: symbolObj?.symbol || 'UNKNOWN',
            name: symbolObj?.description || symbol?.description || 'Unknown',
            units: h.units,
            price: h.price,
            averagePrice: h.average_purchase_price,
            openPnl: h.open_pnl,
            currency: h.currency,
          };
        }),
        accountCount: accounts.length,
        holdingsCount: holdings.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('SnapTrade holdings error:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to fetch holdings';
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
