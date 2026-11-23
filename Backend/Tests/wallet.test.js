import { afterAll, afterEach, beforeAll, describe, expect, test } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "../Models/orderSchema.js";
import { Wallet, WalletTx } from "../Models/walletSchema.js";
import { creditSellersForOrder, releaseOrderEarnings, voidOrderEarnings, releaseDueEarnings } from "../Controllers/walletApis/walletService.js";

let mongod;
const [s1, s2, buyer, pid] = [1, 2, 3, 4].map(() => new mongoose.Types.ObjectId());
process.env.PLATFORM_FEE_PERCENT = "10";

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
afterEach(async () => {
  await Promise.all([Order.deleteMany({}), Wallet.deleteMany({}), WalletTx.deleteMany({})]);
});

const makeOrder = (extra = {}) =>
  Order.create({
    userId: buyer,
    items: [
      { productId: pid, sellerId: s1, name: "A", price: 50, quantity: 2, total: 100 },
      { productId: pid, sellerId: s2, name: "B", price: 20, quantity: 1, total: 20 },
    ],
    amount: 120,
    shippingAddress: { fullName: "Ada", phone: "1234567", street: "1 Main", city: "Lagos", country: "NG" },
    paymentStatus: "paid",
    ...extra,
  });
const wallet = (id) => Wallet.findOne({ userId: id }).lean();

describe("seller earnings", () => {
  test("each seller is credited net of the platform fee into PENDING", async () => {
    await creditSellersForOrder(await makeOrder());
    expect((await wallet(s1)).pending).toBe(90);
    expect((await wallet(s2)).pending).toBe(18);
    expect((await wallet(s1)).available).toBe(0);
    expect(await WalletTx.countDocuments({ type: "sale", status: "pending" })).toBe(2);
  });

  test("release moves pending to available exactly once", async () => {
    const order = await makeOrder();
    await creditSellersForOrder(order);
    await releaseOrderEarnings(order._id);
    await releaseOrderEarnings(order._id); // buyer confirms AND the timer fires
    const w = await wallet(s1);
    expect([w.pending, w.available]).toEqual([0, 90]);
  });

  test("a blocked order's earnings are voided, never withdrawable", async () => {
    const order = await makeOrder();
    await creditSellersForOrder(order);
    await voidOrderEarnings(order._id);
    await releaseOrderEarnings(order._id); // nothing left to release
    const w = await wallet(s1);
    expect([w.pending, w.available, w.totalEarned]).toEqual([0, 0, 0]);
    expect((await WalletTx.findOne({ userId: s1 })).status).toBe("rejected");
  });

  test("the hold timer releases only delivered, old, unblocked orders", async () => {
    const days = (n) => new Date(Date.now() - n * 86400000);
    const oldDelivered = await makeOrder({ fulfilment: "delivered", deliveredAt: days(5) });
    const recentDelivered = await makeOrder({ fulfilment: "delivered", deliveredAt: days(1) });
    const oldShipped = await makeOrder({ fulfilment: "shipped" });
    const oldBlocked = await makeOrder({ fulfilment: "delivered", deliveredAt: days(5), risk: { score: 95, level: "high", review: "blocked" } });
    for (const o of [oldDelivered, recentDelivered, oldShipped, oldBlocked]) await creditSellersForOrder(o);

    expect(await releaseDueEarnings(3)).toBe(1);
    const done = async (o) => WalletTx.countDocuments({ orderId: o._id, status: "completed" });
    expect(await done(oldDelivered)).toBe(2);
    expect(await done(recentDelivered)).toBe(0);
    expect(await done(oldShipped)).toBe(0);
    expect(await done(oldBlocked)).toBe(0);
  });
});
