import { useMemo, useReducer, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../contexts/AuthContext.jsx";
import { apiRequest, makeFetcher } from "../lib/api.js";
import { filtersReducer, initialFilters } from "../reducers/filtersReducer.js";

const categories = ["groceries", "rent", "transport", "fun", "utilities", "other"];
const currencies = ["USD", "EUR", "INR", "GBP", "CAD", "AUD", "JPY"];

function sumByType(txs) {
  let income = 0;
  let expense = 0;
  for (const t of txs || []) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

function groupByCategory(txs) {
  const map = new Map();
  for (const t of txs || []) {
    const key = t.category;
    const signed = t.type === "expense" ? -t.amount : t.amount;
    map.set(key, (map.get(key) || 0) + signed);
  }
  return Array.from(map.entries()).map(([category, netCents]) => ({
    category,
    net: netCents / 100,
  }));
}

export default function DashboardPage() {
  const { profile, token, logout } = useAuth();
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  const fetcher = useMemo(() => makeFetcher(token), [token]);

  const backend = import.meta.env.VITE_BACKEND_URL;

  const txUrl = `${backend}/api/transactions?from=${encodeURIComponent(
    filters.from
  )}&to=${encodeURIComponent(filters.to)}&category=${encodeURIComponent(
    filters.category
  )}&type=${encodeURIComponent(filters.type)}&sort=${encodeURIComponent(
    filters.sort
  )}`;

  const { data: txs, error, isLoading } = useSWR(txUrl, fetcher);

  // External API widget (base USD)
  const { data: rates, isLoading: ratesLoading } = useSWR(
    "https://open.er-api.com/v6/latest/USD",
    (url) => fetch(url).then((r) => r.json())
  );

  // Currency selection (persisted)
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("pp_currency") || "EUR";
  });

  function onCurrencyChange(v) {
    setCurrency(v);
    localStorage.setItem("pp_currency", v);
  }

  // 1 USD -> selected currency rate
  const fx = useMemo(() => {
    if (!rates?.rates) return null;
    if (currency === "USD") return 1;
    return rates.rates[currency] ?? null;
  }, [rates, currency]);

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "groceries",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // EDIT modal state
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const totalCents = (txs || []).reduce(
    (acc, t) => acc + (t.type === "expense" ? -t.amount : t.amount),
    0
  );
  const totals = sumByType(txs);
  const byCategory = groupByCategory(txs);


  async function addTransaction(e) {
    e.preventDefault();
    try {
      const amount = Math.round(Number(form.amount) * 100);

      await apiRequest({
        url: `${backend}/api/transactions`,
        method: "POST",
        token,
        body: { ...form, amount },
      });

      setForm((f) => ({ ...f, amount: "", note: "" }));
      mutate(txUrl);
    } catch (err) {
      alert(`Add failed: ${err.message}`);
      console.error(err);
    }
  }

  function startEdit(t) {
    setEditing(t);
    setEditForm({
      type: t.type,
      amount: (t.amount / 100).toFixed(2),
      category: t.category,
      note: t.note || "",
      date: t.date,
    });
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(null);
    setSavingEdit(false);
  }

  async function updateTransaction(e) {
    e.preventDefault();
    if (!editing || !editForm) return;

    try {
      setSavingEdit(true);
      const amount = Math.round(Number(editForm.amount) * 100);

      await apiRequest({
        url: `${backend}/api/transactions/${editing.id}`,
        method: "PUT",
        token,
        body: { ...editForm, amount },
      });

      closeEdit();
      mutate(txUrl);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
      console.error(err);
      setSavingEdit(false);
    }
  }

  async function deleteTransaction(id) {
    const ok = confirm("Delete this transaction?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await apiRequest({
        url: `${backend}/api/transactions/${id}`,
        method: "DELETE",
        token,
      });

      mutate(txUrl);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          {profile?.picture && (
            <img
              src={profile.picture}
              alt="avatar"
              width="44"
              height="44"
              style={{ borderRadius: 999 }}
            />
          )}
          <div>
            <div className="fw-semibold">Welcome, {profile?.name}</div>
            <div className="text-muted" style={{ fontSize: 14 }}>
              {profile?.email}
            </div>
          </div>
        </div>
        <Button variant="outline-secondary" onClick={logout}>
          Logout
        </Button>
      </div>

      <Row className="g-3">
        <Col md={4}>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-muted">Net total (USD)</div>
                <div style={{ fontSize: 28 }} className="fw-bold">
                  ${(totalCents / 100).toFixed(2)}
                </div>

                {/* converted net */}
                {fx && currency !== "USD" && (
                  <div className="text-muted">
                    {(totalCents / 100 * fx).toFixed(2)} {currency}
                  </div>
                )}

                <div className="mt-2">
                  <Badge bg={totalCents >= 0 ? "success" : "danger"}>
                    {totalCents >= 0 ? "Positive" : "Negative"}
                  </Badge>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">Display currency</div>
                  <Form.Select
                    size="sm"
                    style={{ width: 120 }}
                    value={currency}
                    onChange={(e) => onCurrencyChange(e.target.value)}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="text-muted">FX (1 USD → {currency})</div>
                  {ratesLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <div className="fw-semibold">{fx ? fx.toFixed(3) : "—"}</div>
                  )}
                </div>

                <div className="text-muted" style={{ fontSize: 12 }}>
                  External API: exchange rates
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Add transaction</h5>

              <Form onSubmit={addTransaction}>
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      inputMode="decimal"
                      placeholder="Amount (e.g. 12.50)"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </Col>

                  <Col md={9}>
                    <Form.Control
                      placeholder="Note (optional)"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </Col>

                  <Col md={3}>
                    <Button className="w-100" type="submit">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Body>
              <h5 className="mb-3">Filters</h5>
              <Row className="g-2">
                <Col md={3}>
                  <Form.Control
                    type="date"
                    value={filters.from}
                    onChange={(e) => dispatch({ type: "set_from", value: e.target.value })}
                  />
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="date"
                    value={filters.to}
                    onChange={(e) => dispatch({ type: "set_to", value: e.target.value })}
                  />
                </Col>

                <Col md={3}>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => dispatch({ type: "set_category", value: e.target.value })}
                  >
                    <option value="all">all</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => dispatch({ type: "set_type", value: e.target.value })}
                  >
                    <option value="all">all</option>
                    <option value="expense">expense</option>
                    <option value="income">income</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Transactions</h5>
                {isLoading && <Spinner size="sm" />}
              </div>

              {error && (
                <div className="alert alert-danger mt-3">
                  Failed to load transactions.
                  <div className="small mt-1">{String(error.message)}</div>
                </div>
              )}

              <Table responsive hover className="mt-3 mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Note</th>
                    <th className="text-end">Amount (USD)</th>
                    <th className="text-end">Amount ({currency})</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {(txs || []).map((t) => {
                      const usd = t.amount / 100;
                      const converted = fx ? usd * fx : null;

                      return (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td>{t.date}</td>
                          <td>{t.type}</td>
                          <td>{t.category}</td>
                          <td>{t.note || "—"}</td>
                          <td className="text-end">${usd.toFixed(2)}</td>
                          <td className="text-end">
                            {converted !== null ? `${converted.toFixed(2)} ${currency}` : "—"}
                          </td>
                          <td className="text-end">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => startEdit(t)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={deletingId === t.id}
                              onClick={() => deleteTransaction(t.id)}
                            >
                              {deletingId === t.id ? "Deleting..." : "Delete"}
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </Table>

              {!isLoading && !error && (txs?.length ?? 0) === 0 && (
                <div className="text-muted mt-3">No transactions yet. Add one above.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={!!editing} onHide={closeEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit transaction</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editForm && (
            <Form onSubmit={updateTransaction}>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Form.Select>
                </Col>

                <Col md={4}>
                  <Form.Control
                    inputMode="decimal"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    required
                  />
                </Col>

                <Col md={4}>
                  <Form.Control
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                </Col>

                <Col md={6}>
                  <Form.Select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Control
                    placeholder="Note"
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="outline-secondary" type="button" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
