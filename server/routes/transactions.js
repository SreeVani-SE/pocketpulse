import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// GET /api/transactions?from=&to=&category=&type=&sort=
router.get("/", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized (missing user)" });
    }

    const userId = req.user.id;
    const { from, to, category, type, sort } = req.query;

    const q = { userId };

    if (from) q.date = { ...(q.date || {}), $gte: String(from) };
    if (to) q.date = { ...(q.date || {}), $lte: String(to) };
    if (category && category !== "all") q.category = category;
    if (type && type !== "all") q.type = type;

    let sortObj = { date: -1 };
    if (sort === "date_asc") sortObj = { date: 1 };
    if (sort === "amount_desc") sortObj = { amount: -1 };
    if (sort === "amount_asc") sortObj = { amount: 1 };

    const items = await Transaction.find(q).sort(sortObj).lean();

    return res.json(
      items.map((t) => ({
        id: String(t._id),
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        date: t.date,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (e) {
    next(e);
  }
});

// POST /api/transactions
router.post("/", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized (missing user)" });
    }

    const userId = req.user.id;
    const { type, amount, category, note, date } = req.body;

    const created = await Transaction.create({
      userId,
      type,
      amount,
      category,
      note,
      date,
    });

    return res.status(201).json({
      id: String(created._id),
      type: created.type,
      amount: created.amount,
      category: created.category,
      note: created.note,
      date: created.date,
    });
  } catch (e) {
    if (e?.name === "ValidationError") {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized (missing user)" });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });

    return res.json({
      id: String(updated._id),
      type: updated.type,
      amount: updated.amount,
      category: updated.category,
      note: updated.note,
      date: updated.date,
    });
  } catch (e) {
    if (e?.name === "ValidationError") {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized (missing user)" });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ error: "Not found" });

    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
