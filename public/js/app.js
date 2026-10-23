const $ = (selector) => document.querySelector(selector);
const state = { user: null, foods: [], categories: ["All"], category: "All", search: "", cart: readCart(), authMode: "login", toastTimer: null };
const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
function readCart() { try { return JSON.parse(localStorage.getItem("foodiehub-cart") || "[]"); } catch { return []; } }
function saveCart() { localStorage.setItem("foodiehub-cart", JSON.stringify(state.cart)); updateCartCount(); }
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}
function updateCartCount() { $("#cartCount").textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0); }
function updateAuthUI() {
  $("#loginOpen").hidden = !!state.user;
  $("#logoutBtn").hidden = !state.user;
  $("#ordersNav").hidden = !state.user;
  $("#adminNav").hidden = state.user?.role !== "admin";
  $("#orders").classList.toggle("hidden", !state.user);
  $("#admin").classList.toggle("hidden", state.user?.role !== "admin");
}
function openModal(id) { $("#" + id).classList.remove("hidden"); }
function closeModal(id) { $("#" + id).classList.add("hidden"); }
function openCart() { $("#cartBackdrop").classList.remove("hidden"); $("#cartDrawer").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden", "false"); renderCart(); }
function closeCart() { $("#cartBackdrop").classList.add("hidden"); $("#cartDrawer").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden", "true"); }
function setAuthMode(mode) {
  state.authMode = mode; const registering = mode === "register";
  $("#authTitle").textContent = registering ? "Create your account" : "Welcome back";
  $("#authSubtitle").textContent = registering ? "Join FoodieHub and find your favourites." : "Log in to order your favourites.";
  $("#nameField").classList.toggle("hidden", !registering);
  $("#authName").required = registering;
  $("#authPassword").autocomplete = registering ? "new-password" : "current-password";
  $("#authSubmit").textContent = registering ? "Create account" : "Log in";
  $("#switchText").textContent = registering ? "Already have an account?" : "New to FoodieHub?";
  $("#switchAuth").textContent = registering ? "Log in" : "Create account";
  $("#authError").textContent = "";
}
async function loadFoods() {
  try {
    const data = await api("/api/foods");
    state.foods = data.foods;
    state.categories = ["All", ...new Set(data.foods.map(food => food.category))];
    renderFilters(); renderFoods();
  } catch (err) { $("#foodGrid").innerHTML = `<p class="muted">${escapeHtml(err.message)}. Check that the server and database are running.</p>`; }
}
function renderFilters() {
  $("#categoryFilters").innerHTML = state.categories.map(category => `<button class="filter-btn ${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
}
function renderFoods() {
  const filtered = state.foods.filter(food => (state.category === "All" || food.category === state.category) && food.name.toLowerCase().includes(state.search.toLowerCase()));
  $("#foodGrid").innerHTML = filtered.length ? filtered.map(food => `
    <article class="food-card">
      <img class="food-image" src="${escapeHtml(food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700")}" alt="${escapeHtml(food.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700'">
      <div class="food-body"><div class="food-meta"><h3>${escapeHtml(food.name)}</h3><span class="food-tag ${food.vegetarian ? "" : "nonveg"}">${food.vegetarian ? "Veg" : "Non-veg"}</span></div>
      <p class="food-description">${escapeHtml(food.description)}</p><div class="food-bottom"><span class="price">${money(food.price)}</span><button class="add-btn" data-add="${food._id}">+ Add</button></div></div>
    </article>`).join("") : `<p class="muted">No food matched your search. Try another category.</p>`;
}
function addToCart(id) {
  const food = state.foods.find(item => item._id === id);
  if (!food) return;
  const existing = state.cart.find(item => item.foodId === id);
  if (existing) existing.quantity = Math.min(50, existing.quantity + 1);
  else state.cart.push({ foodId: id, name: food.name, price: food.price, image: food.image, quantity: 1 });
  saveCart(); renderCart(); toast(`${food.name} added to your cart.`);
}
function cartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 30;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
function renderCart() {
  const container = $("#cartItems");
  if (!state.cart.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛍️</div><h3>Your cart is empty</h3><p>Pick something delicious from the menu.</p></div>`;
    $("#cartSummary").innerHTML = ""; $("#checkoutOpen").disabled = true; return;
  }
  $("#checkoutOpen").disabled = false;
  container.innerHTML = state.cart.map(item => `<div class="cart-line"><div><h4>${escapeHtml(item.name)}</h4><small>${money(item.price)} each</small><div class="qty-controls"><button data-qty="${item.foodId}" data-delta="-1" aria-label="Decrease quantity">−</button><strong>${item.quantity}</strong><button data-qty="${item.foodId}" data-delta="1" aria-label="Increase quantity">+</button><button class="link-button" data-remove="${item.foodId}">Remove</button></div></div><strong>${money(item.price * item.quantity)}</strong></div>`).join("");
  const t = cartTotals();
  $("#cartSummary").innerHTML = `<div class="summary-row"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div class="summary-row"><span>Delivery fee</span><strong>${t.deliveryFee ? money(t.deliveryFee) : "Free"}</strong></div>${t.subtotal < 499 ? `<div class="summary-row"><span>Free delivery above ₹499</span><span>${money(499 - t.subtotal)} to go</span></div>` : ""}<div class="summary-row total"><span>Total</span><strong>${money(t.total)}</strong></div>`;
}
function changeQuantity(id, delta) {
  const item = state.cart.find(x => x.foodId === id); if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) state.cart = state.cart.filter(x => x.foodId !== id);
  else item.quantity = Math.min(50, item.quantity);
  saveCart(); renderCart();
}
async function refreshUser() {
  try { const data = await api("/api/auth/me"); state.user = data.user; }
  catch { state.user = null; }
  updateAuthUI();
}
function formatDate(value) { return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
async function loadOrders() {
  if (!state.user) return;
  try {
    const { orders } = await api("/api/orders/mine");
    $("#ordersList").innerHTML = orders.length ? orders.map(order => `<article class="order-card"><div class="order-top"><div><h3>Order #${escapeHtml(order._id.slice(-8).toUpperCase())}</h3><small class="muted">${formatDate(order.createdAt)}</small></div><span class="status">${escapeHtml(order.status)}</span></div><p class="order-items">${order.items.map(item => `${escapeHtml(item.name)} × ${item.quantity}`).join("<br>")}</p><div class="summary-row"><span>Delivery to</span><span>${escapeHtml(order.deliveryAddress)}</span></div><div class="summary-row total"><span>Total · ${escapeHtml(order.paymentMethod)}</span><strong>${money(order.total)}</strong></div></article>`).join("") : `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3><p>Your orders will appear here after checkout.</p></div>`;
  } catch (err) { $("#ordersList").innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`; }
}
async function loadAdmin() {
  if (state.user?.role !== "admin") return;
  try {
    const [dashboard, foodsData] = await Promise.all([api("/api/admin/dashboard"), api("/api/admin/foods")]);
    $("#adminPanel").innerHTML = `
      <div class="admin-stats"><div class="stat-card"><span>Food items</span><strong>${dashboard.stats.foodCount}</strong></div><div class="stat-card"><span>Total orders</span><strong>${dashboard.stats.orderCount}</strong></div><div class="stat-card"><span>Registered users</span><strong>${dashboard.stats.userCount}</strong></div></div>
      <div class="admin-layout"><section class="admin-box"><h3 id="foodFormTitle">Add a food item</h3><form id="foodForm"><input type="hidden" id="foodId"><label for="foodName">Name</label><input id="foodName" required maxlength="100"><label for="foodDescription">Description</label><textarea id="foodDescription" required maxlength="500" rows="2"></textarea><label for="foodCategory">Category</label><input id="foodCategory" required placeholder="e.g. Indian"><label for="foodPrice">Price (₹)</label><input id="foodPrice" required type="number" min="1" step="1"><label for="foodImage">Image URL (optional)</label><input id="foodImage" type="url"><label><input id="foodVeg" type="checkbox" checked style="width:auto"> Vegetarian</label><p id="foodFormError" class="form-error"></p><button class="btn btn-primary btn-full" type="submit">Save food item</button><button class="btn btn-ghost btn-full" type="button" id="foodCancel" hidden>Cancel edit</button></form></section>
      <section class="admin-box"><h3>Manage food menu</h3><div>${foodsData.foods.map(food => `<div class="admin-food-row"><div><strong>${escapeHtml(food.name)}</strong><small>${escapeHtml(food.category)} · ${money(food.price)} ${food.available ? "" : "· Unavailable"}</small></div><div><button class="small-btn" data-edit-food="${food._id}">Edit</button><button class="small-btn danger" data-delete-food="${food._id}">Delete</button></div></div>`).join("") || "<p class='muted'>No food items yet.</p>"}</div></section></div>
      <section class="admin-box" style="margin-top:22px"><h3>Manage orders</h3><div>${dashboard.orders.map(order => `<div class="admin-order-row"><div><strong>#${escapeHtml(order._id.slice(-8).toUpperCase())} · ${escapeHtml(order.user?.name || "Customer")}</strong><small>${formatDate(order.createdAt)} · ${money(order.total)}</small></div><div><select aria-label="Order status" data-order-status="${order._id}">${["Placed","Confirmed","Preparing","Out for delivery","Delivered","Cancelled"].map(s => `<option ${order.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div></div>`).join("") || "<p class='muted'>No orders yet.</p>"}</div></section>`;
  } catch (err) { $("#adminPanel").innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`; }
}
function resetFoodForm() { $("#foodForm").reset(); $("#foodId").value = ""; $("#foodVeg").checked = true; $("#foodFormTitle").textContent = "Add a food item"; $("#foodForm button[type=submit]").textContent = "Save food item"; $("#foodCancel").hidden = true; }
document.addEventListener("click", async event => {
  const target = event.target;
  if (target.closest("[data-close]")) closeModal(target.closest("[data-close]").dataset.close);
  if (target.id === "loginOpen") { setAuthMode("login"); openModal("authModal"); }
  if (target.id === "switchAuth") { setAuthMode(state.authMode === "login" ? "register" : "login"); }
  if (target.id === "cartOpen") openCart();
  if (target.id === "cartClose" || target.id === "cartBackdrop") closeCart();
  if (target.id === "checkoutOpen") {
    if (!state.cart.length) return;
    if (!state.user) { closeCart(); setAuthMode("login"); openModal("authModal"); toast("Please log in before checkout."); return; }
    const t = cartTotals(); $("#checkoutSummary").innerHTML = `<div class="summary-row"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div class="summary-row"><span>Delivery</span><strong>${t.deliveryFee ? money(t.deliveryFee) : "Free"}</strong></div><div class="summary-row total"><span>Total due on delivery</span><strong>${money(t.total)}</strong></div>`;
    closeCart(); openModal("checkoutModal");
  }
  if (target.matches("[data-category]")) { state.category = target.dataset.category; renderFilters(); renderFoods(); }
  if (target.matches("[data-add]")) addToCart(target.dataset.add);
  if (target.matches("[data-qty]")) changeQuantity(target.dataset.qty, Number(target.dataset.delta));
  if (target.matches("[data-remove]")) { state.cart = state.cart.filter(x => x.foodId !== target.dataset.remove); saveCart(); renderCart(); }
  if (target.id === "logoutBtn") {
    try { await api("/api/auth/logout", { method: "POST", body: "{}" }); state.user = null; updateAuthUI(); $("#ordersList").innerHTML = ""; $("#adminPanel").innerHTML = ""; toast("You have logged out."); }
    catch (err) { toast(err.message); }
  }
  if (target.matches("[data-edit-food]")) {
    try {
      const { foods } = await api("/api/admin/foods"); const food = foods.find(x => x._id === target.dataset.editFood); if (!food) return;
      $("#foodId").value = food._id; $("#foodName").value = food.name; $("#foodDescription").value = food.description; $("#foodCategory").value = food.category; $("#foodPrice").value = food.price; $("#foodImage").value = food.image || ""; $("#foodVeg").checked = food.vegetarian;
      $("#foodFormTitle").textContent = "Edit food item"; $("#foodForm button[type=submit]").textContent = "Update food item"; $("#foodCancel").hidden = false; $("#foodName").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) { toast(err.message); }
  }
  if (target.matches("[data-delete-food]")) {
    if (!confirm("Delete this food item? Existing orders keep their saved item details.")) return;
    try { await api(`/api/admin/foods/${target.dataset.deleteFood}`, { method: "DELETE" }); await Promise.all([loadAdmin(), loadFoods()]); toast("Food item deleted."); }
    catch (err) { toast(err.message); }
  }
});
document.addEventListener("change", async event => {
  if (event.target.matches("[data-order-status]")) {
    try { await api(`/api/admin/orders/${event.target.dataset.orderStatus}/status`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) }); toast("Order status updated."); await loadAdmin(); }
    catch (err) { toast(err.message); }
  }
});
$("#searchInput").addEventListener("input", event => { state.search = event.target.value; renderFoods(); });
$("#authForm").addEventListener("submit", async event => {
  event.preventDefault(); $("#authError").textContent = "";
  const registering = state.authMode === "register";
  const body = { email: $("#authEmail").value.trim(), password: $("#authPassword").value };
  if (registering) body.name = $("#authName").value.trim();
  try {
    const data = await api(`/api/auth/${registering ? "register" : "login"}`, { method: "POST", body: JSON.stringify(body) });
    state.user = data.user; closeModal("authModal"); $("#authForm").reset(); updateAuthUI();
    toast(`Welcome${state.user.name ? ", " + state.user.name : ""}!`);
    await Promise.all([loadOrders(), loadAdmin()]);
  } catch (err) { $("#authError").textContent = err.message; }
});
$("#checkoutForm").addEventListener("submit", async event => {
  event.preventDefault(); $("#checkoutError").textContent = "";
  const body = { deliveryAddress: $("#deliveryAddress").value.trim(), phone: $("#deliveryPhone").value.trim(), items: state.cart.map(item => ({ foodId: item.foodId, quantity: item.quantity })) };
  try {
    const { order } = await api("/api/orders", { method: "POST", body: JSON.stringify(body) });
    state.cart = []; saveCart(); renderCart(); closeModal("checkoutModal"); $("#checkoutForm").reset();
    toast(`Order placed! Your total is ${money(order.total)}.`);
    await loadOrders(); location.hash = "#orders";
  } catch (err) { $("#checkoutError").textContent = err.message; }
});
document.addEventListener("submit", async event => {
  if (event.target.id !== "foodForm") return;
  event.preventDefault(); $("#foodFormError").textContent = "";
  const id = $("#foodId").value;
  const body = { name: $("#foodName").value.trim(), description: $("#foodDescription").value.trim(), category: $("#foodCategory").value.trim(), price: Number($("#foodPrice").value), image: $("#foodImage").value.trim(), vegetarian: $("#foodVeg").checked, available: true };
  try { await api(id ? `/api/admin/foods/${id}` : "/api/admin/foods", { method: id ? "PATCH" : "POST", body: JSON.stringify(body) }); resetFoodForm(); await Promise.all([loadAdmin(), loadFoods()]); toast(id ? "Food item updated." : "Food item added."); }
  catch (err) { $("#foodFormError").textContent = err.message; }
});
document.addEventListener("click", event => { if (event.target.id === "foodCancel") resetFoodForm(); });
(async function init() {
  updateCartCount(); renderCart(); await refreshUser(); await loadFoods();
  if (state.user) await Promise.all([loadOrders(), loadAdmin()]);
})();