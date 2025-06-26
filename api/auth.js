import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Basic rate limiting by IP (in production, use Redis/database)
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     'unknown';

    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        // Get password from environment variable
        const correctPassword = process.env.ROOM_PASSWORD;
        const jwtSecret = process.env.JWT_SECRET;

        if (!correctPassword || !jwtSecret) {
            console.error('Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Simple constant-time comparison to prevent timing attacks
        if (password.length !== correctPassword.length) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let isValid = true;
        for (let i = 0; i < password.length; i++) {
            if (password[i] !== correctPassword[i]) {
                isValid = false;
            }
        }

        if (isValid) {
            // Create JWT token
            const token = jwt.sign(
                { 
                    access: 'room',
                    ip: clientIP,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                },
                jwtSecret,
                { algorithm: 'HS256' }
            );

            // Set secure HTTP-only cookie
            const cookieOptions = [
                `roomToken=${token}`,
                'HttpOnly',
                'Secure',
                'SameSite=Strict',
                'Path=/',
                'Max-Age=86400' // 24 hours
            ];

            res.setHeader('Set-Cookie', cookieOptions.join('; '));
            
            return res.status(200).json({ 
                success: true,
                message: 'Access granted'
            });
        } else {
            // Log failed attempt (in production, implement proper logging)
            console.log(`Failed login attempt from IP: ${clientIP} at ${new Date().toISOString()}`);
            
            return res.status(401).json({ error: 'Invalid password' });
        }

    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}