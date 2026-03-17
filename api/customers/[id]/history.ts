import { getCustomerHistoryHandler } from "../../../server/handlers/customers.js";
import { storage } from "../../../server/storage.js";

export default async function handler(req: any, res: any) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { id } = req.query;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid customer ID" });
        }

        const result = await getCustomerHistoryHandler(storage, id, req.query);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("History API error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
}