import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Product from "../Models/productSchema.js";
import Cart from "../Models/cartSchema.js";
import Order from "../Models/orderSchema.js";
import {
  buildAndReserve,
  markOrderPaid,
  releaseOrder,
  releaseStaleOrders,
} from "../Controllers/paymentApis/checkoutHelpers.js";
import { flutterwaveWebhook } from "../Controllers/paymentApis/flutterwaveController.js";

let mongod;
const seller = new mongoose.Types.ObjectId();
const buyer = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create(); // downloads a mongod binary on first run
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Promise.all([Product.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);
});

const makeProduct = (over = {}) =>
  Product.create({ name: "Widget", description: "A widget", price: 10, category: "tools", stock: 5, userId: seller, ...over });

const makeCart = (lines) =>
  Cart.create({ userId: buyer, products: lines.map(([p, quantity]) => ({ productId: p._id, quantity, price: 1 })) }); // stale price on purpose

const makeOrder = async (product, qty = 2, extra = {}) =>
  Order.create({
    userId: buyer,
    items: [{ productId: product._id, sellerId: seller, name: product.name, price: product.price, quantity: qty, total: product.price * qty }],
    amount: product.price * qty,
    shippingAddress: { fullName: "Ada", phone: "123", street: "1 Main St", city: "Lagos", country: "NG" },
    ...extra,
  });

describe("buildAndReserve", () => {
  test("uses the database price, not the cart snapshot, and reserves stock", async () => {
    const p = await makeProduct({ price: 25, stock: 5 });
    await makeCart([[p, 2]]);

    const { items, amount } = await buildAndReserve(buyer);

    expect(items[0].price).toBe(25);
    expect(amount).toBe(50);
    expect((await Product.findById(p._id)).stock).toBe(3);
  });

  test("rolls back earlier reservations when a later item is out of stock", async () => {
    const a = await makeProduct({ name: "A", stock: 5 });
    const b = await makeProduct({ name: "B", stock: 1 });
    await makeCart([[a, 2], [b, 3]]);

    await expect(buildAndReserve(buyer)).rejects.toMatchObject({ status: 409 });
    expect((await Product.findById(a._id)).stock).toBe(5); // untouched
    expect((await Product.findById(b._id)).stock).toBe(1);
  });

  test("rejects an empty cart", async () => {
    await expect(buildAndReserve(buyer)).rejects.toMatchObject({ status: 400 });
  });

  test("two buyers cannot both reserve the last unit", async () => {
    const p = await makeProduct({ stock: 1 });
    const other = new mongoose.Types.ObjectId();
    await makeCart([[p, 1]]);
    await Cart.create({ userId: other, products: [{ productId: p._id, quantity: 1, price: 1 }] });

    const results = await Promise.allSettled([buildAndReserve(buyer), buildAndReserve(other)]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await Product.findById(p._id)).stock).toBe(0);
  });
});

describe("markOrderPaid", () => {
  test("is idempotent: webhook retries do not double count", async () => {
    const p = await makeProduct();
    await makeCart([[p, 2]]);
    const order = await makeOrder(p, 2);

    const first = await markOrderPaid(order._id, { providerTransactionId: "tx_1" });
    const second = await markOrderPaid(order._id, { providerTransactionId: "tx_1" });

    expect(first.paymentStatus).toBe("paid");
    expect(second).toBeNull();
    expect((await Product.findById(p._id)).soldCount).toBe(2);
    expect((await Cart.findOne({ userId: buyer })).products).toHaveLength(0);
  });
});

describe("releaseOrder", () => {
  test("restocks exactly once even if called twice", async () => {
    const p = await makeProduct({ stock: 3 });
    const order = await makeOrder(p, 2);

    await releaseOrder(order._id);
    await releaseOrder(order._id);

    expect((await Product.findById(p._id)).stock).toBe(5);
    expect((await Order.findById(order._id)).paymentStatus).toBe("canceled");
  });

  test("never cancels an order that is already paid", async () => {
    const p = await makeProduct();
    const order = await makeOrder(p, 1, { paymentStatus: "paid" });

    expect(await releaseOrder(order._id)).toBeNull();
    expect((await Order.findById(order._id)).paymentStatus).toBe("paid");
  });
});

describe("releaseStaleOrders", () => {
  test("only releases pending orders older than the cutoff", async () => {
    const p = await makeProduct({ stock: 10 });
    const old = await makeOrder(p, 1);
    const fresh = await makeOrder(p, 1);
    await Order.collection.updateOne({ _id: old._id }, { $set: { createdAt: new Date(Date.now() - 2 * 3600 * 1000) } });

    expect(await releaseStaleOrders(45)).toBe(1);
    expect((await Order.findById(old._id)).paymentStatus).toBe("canceled");
    expect((await Order.findById(fresh._id)).paymentStatus).toBe("pending");
  });
});

describe("flutterwaveWebhook authentication", () => {
  const res = () => ({ sendStatus: jest.fn() });

  test("rejects requests without the correct verif-hash", async () => {
    process.env.FLW_SECRET_HASH = "correct-hash";
    const r = res();
    await flutterwaveWebhook({ headers: { "verif-hash": "wrong" }, body: {} }, r);
    expect(r.sendStatus).toHaveBeenCalledWith(401);
  });

  test("rejects everything when no secret hash is configured", async () => {
    delete process.env.FLW_SECRET_HASH;
    const r = res();
    await flutterwaveWebhook({ headers: { "verif-hash": "anything" }, body: {} }, r);
    expect(r.sendStatus).toHaveBeenCalledWith(401);
  });

  test("acknowledges authenticated events it does not handle", async () => {
    process.env.FLW_SECRET_HASH = "correct-hash";
    const r = res();
    await flutterwaveWebhook({ headers: { "verif-hash": "correct-hash" }, body: { event: "transfer.completed" } }, r);
    expect(r.sendStatus).toHaveBeenCalledWith(200);
  });
});
