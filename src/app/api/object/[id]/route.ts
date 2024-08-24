import { NextRequest, NextResponse } from 'next/server';
import { buildUrl } from '@/utils/url-builder';

interface URLParams {
    id: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: URLParams }
) {
    const { id } = params;

    if (id) {
        const url = buildUrl(`objects/${id}`, {});

        try {
            const response = await fetch(url);
            const data = await response.json();

            return NextResponse.json(data);
        } catch (error) {
            return NextResponse.json({ error: 'An Error Occurred' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
