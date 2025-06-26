import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the token from cookies
        const token = req.cookies.roomToken;
        
        if (!token) {
            return res.status(401).json({ error: 'No access token' });
        }

        // Verify the JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET not found in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            
            // Check if token has expired
            if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                return res.status(401).json({ error: 'Token expired' });
            }
            
            // Token is valid
            return res.status(200).json({ 
                success: true,
                message: 'Access verified'
            });
            
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            return res.status(401).json({ error: 'Invalid token' });
        }

    } catch (error) {
        console.error('Access verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}