import { NextRequest, NextResponse } from 'next/server';
import { buildUrl } from '@/utils/url-builder';

interface URLParams {
  query: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: URLParams }
) {
  const { query } = params;

  if (query) {
    // q key is required for the search endpoint
    const url = buildUrl('search', { q: query });

    try {
      const response = await fetch(url)
        .then((res) => res.json());
      
      return NextResponse.json(response);
    } catch (error) {
      return NextResponse.json({ error: 'An Error Occurred' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}