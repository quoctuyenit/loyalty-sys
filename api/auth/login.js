export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { secretKey } = req.body;
    const adminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey) {
        return res.status(500).json({
            success: false,
            message: "Server not configured"
        });
    }

    if (secretKey === adminKey) {
        return res.json({ success: true });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid secret key"
    });
}