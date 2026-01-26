// backend/routes/orderRoutes.js
import express from 'express';
import Stripe from 'stripe'; 
import { 
    createOrder, 
    getAllOrders, 
    updateOrderStatus 
} from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @route   POST /api/orders/create-checkout-session
 * @desc    Stripe fizetési munkamenet indítása + Rendelés mentése DB-be
 */
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
    try {
        const { items, customerEmail } = req.body;
        // Dinamikus import a körkörös függőségek elkerülésére
        const Order = (await import('../models/Order.js')).default;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'A kosár üres.' });
        }

        // 1. LÉPÉS: Rendelések mentése az adatbázisba (pending státusszal)
        // Így az AdminOrdersView már látni fogja őket a fizetés közben is
        const savedOrders = await Promise.all(items.map(async (item) => {
            return await Order.create({
                userId: req.user.id,
                customerName: req.user.name || 'Vendég',
                customerEmail: customerEmail,
                productType: item.productId,
                size: item.size || 'N/A',
                uniqueCode: item.uniqueCode,
                qrStyle: item.qrStyle || 'default',
                status: 'pending', // Kezdő állapot
                totalPrice: parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || 0)
            });
        }));

        // 2. LÉPÉS: Stripe kosár összeállítása
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: `${item.name} (${item.uniqueCode})`,
                    images: [`https://oovoo-backend.onrender.com/schemes/${item.qrStyle}.png`],
                    description: `Méret: ${item.size || 'N/A'}`,
                },
                unit_amount: Math.round(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 100), 
            },
            quantity: 1,
        }));

        // 3. LÉPÉS: Munkamenet létrehozása
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: customerEmail,
            // 🔥 JAVÍTVA: A pontos beta1-es URL-re irányítunk vissza
            success_url: 'https://oovoo-beta1.onrender.com/success',
            cancel_url: 'https://oovoo-beta1.onrender.com/cancel',
            metadata: {
                userId: req.user.id,
                orderIds: JSON.stringify(savedOrders.map(o => o._id))
            }
        });

        res.json({ success: true, id: session.id, url: session.url });
    } catch (error) {
        console.error("🔥 Stripe Checkout Error:", error);
        res.status(500).json({ success: false, message: 'Fizetési hiba történt.' });
    }
});

/**
 * @route   POST /api/orders/add
 */
router.post('/add', authMiddleware, createOrder);

/**
 * @route   GET /api/orders/admin-list
 */
router.get(
    '/admin-list', 
    authMiddleware, 
    adminMiddleware, 
    getAllOrders
);

/**
 * @route   PATCH /api/orders/status/:orderId
 */
router.patch(
    '/status/:orderId', 
    authMiddleware, 
    adminMiddleware, 
    updateOrderStatus
);

/**
 * @route   GET /api/orders/my-orders
 */
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const Order = (await import('../models/Order.js')).default;
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Hiba a saját rendelések lekérésekor.' });
    }
});

export default router;