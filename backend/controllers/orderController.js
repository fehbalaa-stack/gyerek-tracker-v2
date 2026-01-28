// backend/controllers/orderController.js
import Order from '../models/Order.js';
import Tracker from '../models/Tracker.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔥 SEGÉDFÜGGVÉNY: A tényleges Marcsika-logika végrehajtása
 * Ezt hívjuk meg a Webhookból ÉS a manuális státuszváltásból is.
 */
const applyMarcsikaLogic = async (order) => {
  if (order.targetTrackerId) {
    await Tracker.findByIdAndUpdate(order.targetTrackerId, {
      $push: { 
        skins: { 
          styleId: order.qrStyle, 
          purchasedAt: new Date(),
          orderId: order._id 
        } 
      },
      $set: { qrStyle: order.qrStyle } 
    });
    console.log(`✨ Skin (${order.qrStyle}) hozzáadva a trackerhez: ${order.targetTrackerId}`);
  }
};

/**
 * STRIPE WEBHOOK KEZELŐ
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderIds = session.metadata.orderIds ? JSON.parse(session.metadata.orderIds) : [];

    try {
      if (orderIds.length > 0) {
        const paidOrders = await Order.find({ _id: { $in: orderIds } });

        for (const order of paidOrders) {
          await applyMarcsikaLogic(order); // 🔥 LOGIKA HIVÁSA
        }

        await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { paymentStatus: 'paid', status: 'processing' } } // Automatikusan gyártásba teszi
        );
      }
    } catch (dbErr) {
      console.error("❌ Hiba a webhook frissítéskor:", dbErr);
    }
  }
  res.json({ received: true });
};

/**
 * Új rendelés létrehozása
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
      targetTrackerId: targetTrackerId || null,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Szerverhiba.' });
  }
};

/**
 * Összes rendelés lekérése
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Hiba a lekérdezéskor.' });
  }
};

/**
 * Rendelés státuszának frissítése (Admin által: VÁR -> GYÁRTÁS -> KÉSZ)
 * 🔥 JAVÍTVA: Ha itt váltasz státuszt, akkor is lefut a skin-push!
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Rendelés nem található.' });

    // Ha most váltunk 'processing' (gyártás) vagy 'shipped' (kifizetett/kész) állapotra, 
    // és még nem futott le a logika, akkor most lefuttatjuk.
    if ((status === 'processing' || status === 'shipped') && order.status === 'pending') {
      await applyMarcsikaLogic(order);
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a frissítéskor.' });
  }
};