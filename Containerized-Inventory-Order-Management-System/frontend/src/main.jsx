import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import "./styles.css";

const emptyProduct = { name: "", sku: "", price: "", quantity: "" };
const emptyCustomer = { full_name: "", email: "", phone: "" };

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [orderForm, setOrderForm] = useState({ customer_id: "", product_id: "", quantity: 1 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const [productsData, customersData, ordersData, dashboardData] = await Promise.all([
      api.products(),
      api.customers(),
      api.orders(),
      api.dashboard(),
    ]);
    setProducts(productsData);
    setCustomers(customersData);
    setOrders(ordersData);
    setDashboard(dashboardData);
  }

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, []);

  const lowStock = useMemo(() => products.filter((product) => product.quantity <= 5), [products]);

  async function handleAction(action, successText) {
    setError("");
    setMessage("");
    try {
      await action();
      await loadData();
      setMessage(successText);
    } catch (err) {
      setError(err.message);
    }
  }

  function validateProduct() {
    if (!productForm.name || !productForm.sku || Number(productForm.price) <= 0 || Number(productForm.quantity) < 0) {
      throw new Error("Enter valid product name, SKU, price, and non-negative stock.");
    }
  }

  function submitProduct(event) {
    event.preventDefault();
    handleAction(async () => {
      validateProduct();
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };
      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
      } else {
        await api.createProduct(payload);
      }
      setProductForm(emptyProduct);
      setEditingProductId(null);
    }, editingProductId ? "Product updated." : "Product added.");
  }

  function submitCustomer(event) {
    event.preventDefault();
    handleAction(async () => {
      if (!customerForm.full_name || !customerForm.email || !customerForm.phone) {
        throw new Error("Enter customer name, email, and phone.");
      }
      await api.createCustomer(customerForm);
      setCustomerForm(emptyCustomer);
    }, "Customer added.");
  }

  function submitOrder(event) {
    event.preventDefault();
    handleAction(async () => {
      if (!orderForm.customer_id || !orderForm.product_id || Number(orderForm.quantity) <= 0) {
        throw new Error("Select a customer, product, and valid quantity.");
      }
      await api.createOrder({
        customer_id: Number(orderForm.customer_id),
        items: [{ product_id: Number(orderForm.product_id), quantity: Number(orderForm.quantity) }],
      });
      setOrderForm({ customer_id: "", product_id: "", quantity: 1 });
    }, "Order created and stock updated.");
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Production Inventory</p>
          <h1>Inventory & Order Management</h1>
        </div>
      </header>

      {(message || error) && <div className={error ? "alert error" : "alert success"}>{error || message}</div>}

      <section className="stats">
        <Stat label="Products" value={dashboard?.total_products ?? 0} />
        <Stat label="Customers" value={dashboard?.total_customers ?? 0} />
        <Stat label="Orders" value={dashboard?.total_orders ?? 0} />
        <Stat label="Low Stock" value={dashboard?.low_stock_products ?? lowStock.length} />
      </section>

      <section className="grid">
        <Panel title={editingProductId ? "Update Product" : "Add Product"}>
          <form onSubmit={submitProduct} className="form">
            <input placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            <input placeholder="SKU / code" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
            <input type="number" min="0.01" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
            <input type="number" min="0" placeholder="Quantity" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
            <button type="submit">{editingProductId ? "Save Product" : "Add Product"}</button>
          </form>
        </Panel>

        <Panel title="Add Customer">
          <form onSubmit={submitCustomer} className="form">
            <input placeholder="Full name" value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} />
            <input type="email" placeholder="Email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
            <input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
            <button type="submit">Add Customer</button>
          </form>
        </Panel>

        <Panel title="Create Order">
          <form onSubmit={submitOrder} className="form">
            <select value={orderForm.customer_id} onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
            </select>
            <select value={orderForm.product_id} onChange={(e) => setOrderForm({ ...orderForm, product_id: e.target.value })}>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.quantity} left)</option>)}
            </select>
            <input type="number" min="1" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} />
            <button type="submit">Create Order</button>
          </form>
        </Panel>
      </section>

      <section className="tables">
        <Panel title="Products">
          <DataTable headers={["Name", "SKU", "Price", "Stock", "Actions"]}>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>${product.price}</td>
                <td className={product.quantity <= 5 ? "low" : ""}>{product.quantity}</td>
                <td className="actions">
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button className="danger" onClick={() => handleAction(() => api.deleteProduct(product.id), "Product deleted.")}>Delete</button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Customers">
          <DataTable headers={["Name", "Email", "Phone", "Actions"]}>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td><button className="danger" onClick={() => handleAction(() => api.deleteCustomer(customer.id), "Customer deleted.")}>Delete</button></td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Orders">
          <DataTable headers={["ID", "Customer", "Items", "Total", "Actions"]}>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer.full_name}</td>
                <td>{order.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", ")}</td>
                <td>${order.total_amount}</td>
                <td><button className="danger" onClick={() => handleAction(() => api.deleteOrder(order.id), "Order deleted.")}>Delete</button></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return <article className="stat"><span>{label}</span><strong>{value}</strong></article>;
}

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function DataTable({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
