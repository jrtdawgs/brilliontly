import { NextResponse } from 'next/server';
import { FOUNDER_PORTFOLIO } from '@/lib/db/portfolio';

// GET /api/v1/portfolio - List portfolios
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      user: FOUNDER_PORTFOLIO.name,
      accounts: FOUNDER_PORTFOLIO.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        holdingsCount: a.holdings.length,
        holdings: a.holdings.map((h) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          costBasis: h.costBasis,
          targetAllocation: h.targetAllocation,
          assetType: h.assetType,
        })),
      })),
    },
  });
}

// POST /api/v1/portfolio - Create portfolio (future SaaS)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Phase 1: Validate and echo back
    return NextResponse.json({
      success: true,
      message: 'Portfolio endpoint ready. Multi-user support coming in Phase 3.',
      received: body,
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
    }, { status: 400 });
  }
}
