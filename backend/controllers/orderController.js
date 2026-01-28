// backend/controllers/orderController.js
import Order from '../models/Order.js';
import Tracker from '../models/Tracker.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔥 STRIPE WEBHOOK KEZELŐ
 * Megjegyzés: Ez csak akkor fog működni, ha a Render környezeti változók között 
 * be van állítva a STRIPE_WEBHOOK_SECRET!
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook Aláírás Hiba: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const orderIds = session.metadata.orderIds ? JSON.parse(session.metadata.orderIds) : [];

    try {
      if (orderIds.length > 0) {
        // 1. Rendelések lekérése a feldolgozáshoz
        const paidOrders = await Order.find({ _id: { $in: orderIds } });

        for (const order of paidOrders) {
          // 🔥 MARCSIKA-LOGIKA: Ha meglévő trackerhez jött a rendelés, adjuk hozzá a skint
          if (order.targetTrackerId) {
            await Tracker.findByIdAndUpdate(order.targetTrackerId, {
              $push: { 
                skins: { 
                  styleId: order.qrStyle, 
                  purchasedAt: new Date(),
                  orderId: order._id 
                } 
              },
              $set: { qrStyle: order.qrStyle } // Az új vásárlás lesz az aktív stílus
            });
            console.log(`✨ Skin (${order.qrStyle}) hozzáadva a trackerhez: ${order.targetTrackerId}`);
          }
        }

        // 2. Frissítjük a rendeléseket 'paid' státuszra
        await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { paymentStatus: 'paid' } }
        );
        console.log(`✅ Rendelések fizetve és feldolgozva: ${orderIds.join(', ')}`);
      }
    } catch (dbErr) {
      console.error("❌ Hiba a webhook frissítéskor:", dbErr);
    }
  }

  res.json({ received: true });
};

/**
 * Új rendelés létrehozása (Kézi rögzítéshez)
 */
export const createOrder = async (req, res) => {
  try {
    const { productType, uniqueCode, qrStyle, customerName, customerEmail, size, targetTrackerId } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      customerName,
      customerEmail,
      productType,
      uniqueCode,
      qrStyle,
      size: size || 'N/A',
      targetTrackerId: targetTrackerId || null, // 🔥 Eltároljuk, ha meglévő eszközhöz kérik
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Szerverhiba.' });
  }
};

/**
 * Összes rendelés lekérése (Admin felülethez)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Lekérdezési hiba:", error);
    res.status(500).json({ message: 'Hiba a lekérdezéskor.' });
  }
};

/**
 * Rendelés státuszának frissítése (Admin által: VÁR -> GYÁRTÁS -> KÉSZ)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Rendelés nem található.' });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a frissítéskor.' });
  }
};