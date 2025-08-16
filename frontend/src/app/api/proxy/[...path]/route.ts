import { NextRequest, NextResponse } from 'next/server';

async function extractPath(context: any): Promise<string[]> {
  // Works for both Promise<{path: string[]}> and {path: string[]}
  const params = await context?.params;
  const path = params?.path ?? [];
  return Array.isArray(path) ? path : [String(path)];
}

export async function GET(request: NextRequest, context: any) {
  const path = await extractPath(context);
  return handleProxyRequest(request, path, 'GET');
}

export async function POST(request: NextRequest, context: any) {
  const path = await extractPath(context);
  return handleProxyRequest(request, path, 'POST');
}

export async function PUT(request: NextRequest, context: any) {
  const path = await extractPath(context);
  return handleProxyRequest(request, path, 'PUT');
}

export async function PATCH(request: NextRequest, context: any) {
  const path = await extractPath(context);
  return handleProxyRequest(request, path, 'PATCH');
}

export async function DELETE(request: NextRequest, context: any) {
  const path = await extractPath(context);
  return handleProxyRequest(request, path, 'DELETE');
}

export async function OPTIONS(request: NextRequest, context: any) {
  await extractPath(context); // just to consume if needed
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const path = pathSegments.join('/');

    // Get query parameters from the original request
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();

    // Construct the full backend URL with query parameters
    const fullUrl = queryParams
      ? `${backendUrl}/${path}?${queryParams}`
      : `${backendUrl}/${path}`;

    // Get the request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        // Handle form data
        const formData = await request.formData();
        body = formData;
      } else {
        // Handle text/JSON data
        try {
          body = await request.text();
        } catch {
          // No body to read
        }
      }
    }

    // Get headers from the original request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Add CORS headers
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] =
      'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] =
      'Content-Type, Authorization, X-Requested-With';

    // Remove Content-Type and Content-Length headers for FormData
    if (body instanceof FormData) {
      delete headers['content-type'];
      delete headers['content-length'];
    }

    // Make the request to the backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Get the response data
    const responseData = await response.text();

    // Create a new response with the same status and headers
    const newResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy headers from the backend response
    response.headers.forEach((value, key) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
