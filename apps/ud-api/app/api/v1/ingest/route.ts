import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ud_live_')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const webhookUrl = formData.get('webhook_url');

    if (!file) {
      return NextResponse.json({ error: 'Bad Request: Missing file payload' }, { status: 400 });
    }

    // Generate a mock tracking ID
    const trackingId = 'uds_job_' + Math.random().toString(36).substring(2, 15);

    // In a real implementation, we would queue the file for processing via a worker
    // and send the result to the webhookUrl.
    
    return NextResponse.json({
      status: 'accepted',
      message: 'Document queued for ingestion.',
      tracking_id: trackingId,
      estimated_completion_time: '1500ms',
      webhook_registered: !!webhookUrl
    }, { status: 202 });

  } catch (error) {
    console.error('Ingestion API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
