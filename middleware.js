import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
    // Only protect routes that start with /secure-room
    if (request.nextUrl.pathname.startsWith('/secure-room')) {
        
        // Get the token from cookies
        const token = request.cookies.get('roomToken')?.value;
        
        if (!token) {
            console.log('No token found, redirecting to login');
            return NextResponse.redirect(new URL('/the-room.html', request.url));
        }

        try {
            // Verify the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Optional: Check if token is from same IP (additional security)
            const currentIP = request.headers.get('x-forwarded-for') || 
                             request.headers.get('x-real-ip') || 
                             request.ip || 
                             'unknown';
            
            // If IPs don't match, could be session hijacking (optional check)
            if (decoded.ip && decoded.ip !== currentIP) {
                console.log(`IP mismatch: token IP ${decoded.ip}, current IP ${currentIP}`);
                // Uncomment the next line if you want strict IP checking
                // return NextResponse.redirect(new URL('/the-room.html', request.url));
            }
            
            // Token is valid, allow access
            console.log('Valid token, allowing access to secure area');
            return NextResponse.next();
            
        } catch (error) {
            console.log('Invalid token:', error.message);
            
            // Clear the invalid cookie
            const response = NextResponse.redirect(new URL('/the-room.html', request.url));
            response.cookies.set('roomToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 0 // Delete the cookie
            });
            
            return response;
        }
    }

    // For all other routes, continue normally
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/secure-room/:path*',
        '/secure-room.html'
    ]
}