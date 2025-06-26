export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Clear the authentication cookie
        res.setHeader('Set-Cookie', [
            'roomToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
        ]);

        return res.status(200).json({ 
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}