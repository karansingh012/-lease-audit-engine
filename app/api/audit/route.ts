import { NextResponse } from 'next/server';
import { RocketRideClient } from 'rocketride';
import fs from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const leaseFile = formData.get('leaseFile') as File | null;
    const invoiceFile = formData.get('invoiceFile') as File | null;

    if (!leaseFile || !invoiceFile) {
      return NextResponse.json({ error: 'Both lease and invoice files are required' }, { status: 400 });
    }

    if (!isPdf(leaseFile) || !isPdf(invoiceFile)) {
      return NextResponse.json({ error: 'Please upload PDF files only.' }, { status: 400 });
    }

    if (leaseFile.size > MAX_FILE_SIZE || invoiceFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Each PDF must be smaller than 25 MB.' }, { status: 413 });
    }

    const apiKey = process.env.ROCKETRIDE_APIKEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ROCKETRIDE_APIKEY is not set' }, { status: 500 });
    }

    const uri = process.env.ROCKETRIDE_URI || 'https://api.rocketride.ai';
    const pipePath = path.join(process.cwd(), 'lease_audit.pipe');
    const pipeline = JSON.parse(await fs.readFile(pipePath, 'utf8'));
    let finalData: unknown = null;

    await RocketRideClient.withConnection({ auth: apiKey, uri }, async (client) => {
      const token = (await client.use({ pipeline, useExisting: true })).token;
      const leaseResult = await client.send(token, new Uint8Array(await leaseFile.arrayBuffer()), { filepath: leaseFile.name }, 'application/pdf');
      const invoiceResult = await client.send(token, new Uint8Array(await invoiceFile.arrayBuffer()), { filepath: invoiceFile.name }, 'application/pdf');
      finalData = invoiceResult || leaseResult;
    });
    
    // Normalize extracted answers for UI consumption
    const result = finalData as {
      data?: { objects?: { body?: { answers?: unknown[] } }; answers?: unknown[] };
      objects?: { body?: { answers?: unknown[] } };
      answers?: unknown[];
    } | null;
    const answers = result?.data?.objects?.body?.answers || result?.objects?.body?.answers || result?.data?.answers || result?.answers || [];

    if (answers.length === 0 || answers.every(answer => typeof answer === 'string' && answer.includes('LLM error'))) {
      throw new Error('The AI audit service did not return a valid audit result.');
    }

    if (answers.length > 0 && result?.data && !result.data.answers) {
      result.data.answers = answers;
    }

    return NextResponse.json({
      data: finalData,
      answers: answers
    });

  } catch (error: unknown) {
    console.error('Audit Error:', error instanceof Error ? error.message : 'Unknown audit failure');
    return NextResponse.json({ error: 'The audit could not be completed. Please try again.' }, { status: 502 });
  }
}
