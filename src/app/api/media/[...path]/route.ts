import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract the full Cloudinary URL from the path parameters
    const fullPath = params.path.join('/');
    
    // Reconstruct the Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/${fullPath}`;
    
    console.log('Proxying request to:', cloudinaryUrl);
    
    // Get the token from the request headers or cookies
    const token = request.headers.get('authorization') || request.cookies.get('token')?.value;
    
    // Create headers for the Cloudinary request
    const headers: HeadersInit = {
      'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    };
    
    // If we have a token, add it to the authorization header
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // Fetch the file from Cloudinary
    const response = await fetch(cloudinaryUrl, {
      headers,
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch from Cloudinary:', response.status, response.statusText);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the content type from Cloudinary response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const filename = cloudinaryUrl.split('/').pop() || 'file';
    
    // Create response headers
    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    };
    
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }
    
    // For PDFs and other documents, set proper headers
    if (contentType.includes('pdf')) {
      responseHeaders['Content-Disposition'] = `inline; filename="${filename}"`;
    }
    
    // Stream the response
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Error proxying media request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Handle HEAD requests for PDF viewers that check file existence
  return GET(request, { params });
}
