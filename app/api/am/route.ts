import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, url } = body;
    const baseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: "Server configuration missing. Check .env variables." }, { status: 500 });
    }

    let apiUrl = "";
    if (action === "send") {
      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
      apiUrl = `${baseUrl}/api/am?action=send&apikey=${apiKey}&email=${encodeURIComponent(email)}`;
    } else if (action === "verif") {
      if (!email || !url) return NextResponse.json({ error: "Email and Magic Link URL are required" }, { status: 400 });
      apiUrl = `${baseUrl}/api/am?action=verif&apikey=${apiKey}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(apiUrl, { method: 'GET' });
    
    let data;
    const textRes = await response.text();
    try {
      data = JSON.parse(textRes);
    } catch (e) {
      if (!response.ok) {
        return NextResponse.json({ error: `External API error: ${response.status} ${response.statusText}` }, { status: response.status });
      }
      return NextResponse.json({ error: "Invalid JSON response from external API" }, { status: 500 });
    }

    if (!response.ok) {
       return NextResponse.json({ error: data.message || data.error || "External API error" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  
  if (action === "ping") {
    try {
      const baseUrl = process.env.API_BASE_URL;
      if (!baseUrl) {
        return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
      }
      
      const response = await fetch(`${baseUrl}/ping`, { method: 'GET' });
      if (response.ok) {
        return NextResponse.json({ status: "online" });
      }
      return NextResponse.json({ error: "API down" }, { status: 502 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
  
