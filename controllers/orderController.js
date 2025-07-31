import Order from "../models/order.js";
import Product from "../models/product.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create a new order
export async function createOrder(req, res) {
  const data = req.body;
  const orderInfo = {
    orderedItems: [],
  };

  if (!req.user) {
    return res.status(401).json({ message: "Please login and try again" });
  }

  orderInfo.email = req.user.email;

  try {
    const lastOrder = await Order.find().sort({ orderDate: -1 }).limit(1);

    if (lastOrder.length === 0) {
      orderInfo.orderId = "ORD0001";
    } else {
      const lastOrderId = lastOrder[0].orderId;
      const lastOrderNumber = parseInt(lastOrderId.replace("ORD", ""), 10); // Specify radix
      const currentOrderNumber = lastOrderNumber + 1;
      orderInfo.orderId = "ORD" + String(currentOrderNumber).padStart(4, "0");
    }

    let oneDayCost = 0;

    for (let i = 0; i < data.orderedItems.length; i++) {
      const item = data.orderedItems[i];
      const product = await Product.findOne({ key: item.key });

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with key ${item.key} not found` });
      }

      if (!product.availability) {
        return res
          .status(400)
          .json({ message: `Product with key ${item.key} is not available` });
      }

      orderInfo.orderedItems.push({
        product: {
          key: product.key,
          name: product.name,
          image: Array.isArray(product.image)
            ? product.image[0]
            : product.image,
          price: product.price,
        },
        quantity: item.qty,
      });

      oneDayCost += product.price * item.qty;
    }

    orderInfo.days = data.days;
    orderInfo.startingDate = new Date(data.startingDate);
    orderInfo.endingDate = new Date(data.endingDate);
    orderInfo.totalAmount = oneDayCost * data.days;
    orderInfo.orderDate = new Date(); // Add orderDate here if missing in schema

    const newOrder = new Order(orderInfo);
    const result = await newOrder.save();

    res.json({ message: "Order created successfully", order: result });
  } catch (e) {
    console.error("Error creating order:", e.message);
    res.status(500).json({ message: "Failed to create order" });
  }
}

// Generate quote without saving the order
export async function getQuote(req, res) {
  const data = req.body;
  const orderInfo = {
    orderedItems: [],
  };

  try {
    let oneDayCost = 0;

    for (let i = 0; i < data.orderedItems.length; i++) {
      const item = data.orderedItems[i];
      const product = await Product.findOne({ key: item.key });

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with key ${item.key} not found` });
      }

      if (!product.availability) {
        return res
          .status(400)
          .json({ message: `Product with key ${item.key} is not available` });
      }

      orderInfo.orderedItems.push({
        product: {
          key: product.key,
          name: product.name,
          image: Array.isArray(product.image)
            ? product.image[0]
            : product.image,
          price: product.price,
        },
        quantity: item.qty,
      });

      oneDayCost += product.price * item.qty;
    }

    orderInfo.days = data.days;
    orderInfo.startingDate = new Date(data.startingDate);
    orderInfo.endingDate = new Date(data.endingDate);
    orderInfo.totalAmount = oneDayCost * data.days;

    res.json({ message: "Order quotation", total: orderInfo.totalAmount });
  } catch (e) {
    console.error("Error getting quote:", e.message);
    res.status(500).json({ message: "Failed to get quote" });
  }
}

// Get all or user's orders
export async function getOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user info" });
    }

    if (isItCustomer(req)) {
      const orders = await Order.find({ email: req.user.email });
      return res.json(orders);
    } else if (isItAdmin(req)) {
      const orders = await Order.find();
      return res.json(orders);
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  } catch (e) {
    console.error("Error fetching orders:", e.message, e.stack);
    res.status(500).json({ error: "Failed to get orders" });
  }
}

// Admin approves or rejects order
export async function approveOrRejectOrder(req, res) {
  const orderId = req.params.orderId;
  const status = req.body.status;

  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await Order.updateOne({ orderId }, { status });

    res.json({ message: "Order approved/rejected successfully" });
  } catch (e) {
    console.error("Error updating order status:", e.message);
    res.status(500).json({ error: "Failed to update order" });
  }
}
