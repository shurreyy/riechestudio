import { NextResponse } from 'next/server';

export function middleware(request) {
    // Only protect routes that start with /secure-room
    if (request.nextUrl.pathname.startsWith('/secure-room')) {
        
        // Get the token from cookies
        const token = request.cookies.get('roomToken')?.value;
        
        if (!token) {
            console.log('No token found, redirecting to login');
            return NextResponse.redirect(new URL('/the-room.html', request.url));
        }

        // For now, just check if token exists and isn't empty
        // The actual JWT verification will be done by the API routes if needed
        if (token && token.length > 10) {
            // Token exists, allow access
            console.log('Token found, allowing access to secure area');
            return NextResponse.next();
        } else {
            console.log('Invalid token, redirecting to login');
            
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