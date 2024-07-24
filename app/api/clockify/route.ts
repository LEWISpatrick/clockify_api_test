// app/api/clockify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CLOCKIFY_API_KEY = process.env.NEXT_PUBLIC_CLOCKIFY_API_KEY;
const WORKSPACE_ID = process.env.NEXT_PUBLIC_CLOCKIFY_WORKSPACE_ID;
const USER_ID = process.env.NEXT_PUBLIC_CLOCKIFY_USER_ID;
const BASE_URL = 'https://api.clockify.me/api/v1';

const getClockifyTimeEntries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries`, {
      headers: {
        'X-Api-Key': CLOCKIFY_API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || 'Error fetching time entries from Clockify');
  }
};

export async function GET(req: NextRequest) {
  try {
    const data = await getClockifyTimeEntries();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
