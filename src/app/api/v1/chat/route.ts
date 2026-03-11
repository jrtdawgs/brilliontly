import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Anthropic from '@anthropic-ai/sdk';
import { getAccounts } from '@/lib/db/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'brilliontly-dev-secret-change-in-production'
);

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('brilliontly-token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string, name: payload.name as string };
  } catch {
    return null;
  }
}

const BASE_PROMPT = `You are Big Bull, a financial advisor built into Brilliontly. You give direct, actionable financial advice based on the user's actual portfolio. You are their advisor — act like it.

How you operate:
- Give real advice. Tell them what you would do and why. Do not hedge with "I am not a financial advisor" or "this is not financial advice." You are their financial advisor inside this app.
- Be direct. If their portfolio is too risky, say so. If they should sell something, say so. If they should buy something, tell them what and why.
- Plain English only. No jargon without explaining it. No markdown, no bullet points, no numbered lists, no emojis. Just talk like a smart friend who manages money.
- Keep it concise. Two to five sentences for simple questions. A short paragraph for complex ones.
- When they ask about their portfolio, reference their actual holdings, account types, and positions. Be specific.
- Be honest about risks but do not be afraid to have a strong opinion.

Your deep expertise:
- Portfolio construction and allocation across 401k, Roth IRA, taxable, and HSA accounts.
- Tax optimization including tax-loss harvesting, asset location strategy, wash sale rules, Roth conversion ladders, and capital gains management.
- Technical analysis including RSI, MACD, volume analysis, support and resistance levels, and momentum signals.
- Capitulation and bottom signals: sharp drops plus extreme volume plus RSI below 30. When you see these converge, tell them it is likely a buying opportunity.
- Leverage decay in 2x and 3x ETFs. Know when to tell them to hold these and when to tell them to get out.
- Macro analysis: Fed policy, DXY dollar strength, yield curve, VIX fear gauge, sector rotation, and how these affect their specific holdings.
- Crypto cycles, halving effects, and correlation with risk assets.
- Options basics, covered calls, protective puts, and when these strategies make sense for their portfolio.
- Retirement planning, contribution limits, employer match optimization, and withdrawal strategies.`;

function buildSystemPrompt(userName: string | null, portfolioContext: string | null): string {
  let prompt = BASE_PROMPT;

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}.`;
  }

  if (portfolioContext) {
    prompt += `\n\nHere is the user's current portfolio data. Use this to give personalized advice when relevant. Reference their actual holdings by name when answering questions.\n\n${portfolioContext}`;
  }

  return prompt;
}

function formatPortfolio(accounts: { id: string; accountType: string; data: { name: string; holdings: { ticker: string; name: string; shares: number; costBasis: number; assetType: string }[] } }[]): string | null {
  if (!accounts || accounts.length === 0) return null;

  const lines: string[] = [];
  for (const acct of accounts) {
    const type = acct.accountType === '401k' ? '401(k)' :
      acct.accountType === 'roth_ira' ? 'Roth IRA' :
      acct.accountType === 'taxable' ? 'Taxable Brokerage' :
      acct.accountType === 'hsa' ? 'HSA' : acct.accountType;

    lines.push(`Account: ${acct.data.name} (${type})`);
    for (const h of acct.data.holdings) {
      const basis = h.costBasis > 0 ? `, cost basis $${h.costBasis.toFixed(2)}` : '';
      lines.push(`  ${h.ticker} - ${h.name}: ${h.shares} shares${basis}`);
    }
  }

  return lines.join('\n');
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI features are not configured yet.' },
        { status: 503 }
      );
    }

    // Load user portfolio if logged in
    const user = await getUser();
    let portfolioContext: string | null = null;
    if (user) {
      try {
        const accounts = await getAccounts(user.userId);
        portfolioContext = formatPortfolio(accounts);
      } catch {
        // Portfolio load failed — continue without it
      }
    }

    const systemPrompt = buildSystemPrompt(user?.name || null, portfolioContext);
    const client = new Anthropic({ apiKey });

    const anthropicMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'bigbull' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ success: true, response: text });
  } catch (err: unknown) {
    console.error('Chat API error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Failed to get a response. Try again.' },
      { status: 500 }
    );
  }
}
