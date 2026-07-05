/* ===================================================
   AESTHETIC BEE — Admin Logic
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const CORRECT_PIN = "2307";

  // Login DOM Elements
  const loginOverlay = document.getElementById('loginOverlay');
  const adminShell   = document.getElementById('adminShell');
  const pinInputs    = document.querySelectorAll('.pin-digit');
  const pinError     = document.getElementById('pinError');
  const loginBtn     = document.getElementById('loginBtn');
  const lockBtn      = document.getElementById('lockBtn');

  // Navigation DOM Elements
  const navItems = document.querySelectorAll('.sidebar-nav-item');
  const panels   = document.querySelectorAll('.admin-panel');

  // In-Memory Database (initialized from JSON files, falling back to local storage)
  let products = [];
  let posts = [];
  let settings = {};
  let contacts = JSON.parse(localStorage.getItem('ab_contacts') || '[]');
  let subscribers = JSON.parse(localStorage.getItem('ab_subscribers') || '[]');

  // Check if already authenticated
  if (sessionStorage.getItem('ab_auth') === 'true') {
    loginOverlay.classList.add('hidden');
    adminShell.classList.remove('hidden');
    initAdminDashboard();
  }

  // PIN Input auto-focus logic
  pinInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (input.value && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      checkAndVerifyPIN();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        pinInputs[index - 1].focus();
      }
    });
  });

  function checkAndVerifyPIN() {
    const enteredPIN = Array.from(pinInputs).map(input => input.value).join('');
    if (enteredPIN.length === 4) {
      if (enteredPIN === CORRECT_PIN) {
        sessionStorage.setItem('ab_auth', 'true');
        loginOverlay.classList.add('hidden');
        adminShell.classList.remove('hidden');
        pinError.classList.remove('show');
        initAdminDashboard();
      } else {
        pinError.classList.add('show');
        // Clear inputs
        pinInputs.forEach(input => input.value = '');
        pinInputs[0].focus();
      }
    }
  }

  loginBtn.addEventListener('click', checkAndVerifyPIN);

  lockBtn.addEventListener('click', () => {
    sessionStorage.removeItem('ab_auth');
    window.location.reload();
  });

  // Panel Switch Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      const targetPanel = item.getAttribute('data-panel');
      panels.forEach(panel => {
        if (panel.id === `panel-${targetPanel}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // Load Data files
  async function loadData() {
    try {
      const prodRes = await fetch('data/products.json');
      products = await prodRes.json();
    } catch (e) {
      console.warn("Failed loading products.json, loading defaults", e);
    }

    try {
      const postRes = await fetch('data/posts.json');
      posts = await postRes.json();
    } catch (e) {
      console.warn("Failed loading posts.json, loading defaults", e);
    }

    try {
      const setRes = await fetch('data/settings.json');
      settings = await setRes.json();
    } catch (e) {
      console.warn("Failed loading settings.json, loading defaults", e);
    }
  }

  // Initialize Dashboard after load
  async function initAdminDashboard() {
    await loadData();
    renderAnalyticsChart();
    renderProductsTable();
    renderPostsTable();
    renderContactsTable();
    renderSubscribersTable();
    populateSettingsForm();
    updateBadges();
  }

  function updateBadges() {
    const unreadCount = contacts.length;
    const badge = document.getElementById('contactBadge');
    if (badge) {
      badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
    const subCountEl = document.getElementById('subCount');
    if (subCountEl) subCountEl.textContent = subscribers.length;

    const msgCountEl = document.getElementById('msgCount');
    if (msgCountEl) msgCountEl.textContent = contacts.length;
  }

  // 📈 Chart.js Analytics Implementation
  let chartInstance = null;
  function renderAnalyticsChart() {
    const ctx = document.getElementById('viewsChart');
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Page Views',
          data: [1020, 1150, 980, 1250, 1420, 1300, 1400],
          borderColor: '#C97B4A',
          backgroundColor: 'rgba(201, 123, 74, 0.05)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#e5e0d8' }, ticks: { color: '#7a7166' } },
          x: { grid: { display: false }, ticks: { color: '#7a7166' } }
        }
      }
    });
  }

  // 🛍️ PRODUCTS MANAGEMENT
  const addProductBtn = document.getElementById('addProductBtn');
  const productForm   = document.getElementById('productForm');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  const saveProductBtn   = document.getElementById('saveProductBtn');

  addProductBtn.addEventListener('click', () => {
    document.getElementById('productFormTitle').textContent = "New Product";
    clearProductForm();
    productForm.classList.remove('hidden');
  });

  cancelProductBtn.addEventListener('click', () => {
    productForm.classList.add('hidden');
    clearProductForm();
  });

  function clearProductForm() {
    document.getElementById('pId').value = "";
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pCategory').value = "home-decor";
    document.getElementById('pSubcat').value = "";
    document.getElementById('pBadge').value = "";
    document.getElementById('pBadgeType').value = "accent";
    document.getElementById('pImage').value = "";
    document.getElementById('pLink').value = "product.html";
  }

  saveProductBtn.addEventListener('click', () => {
    const id = document.getElementById('pId').value;
    const name = document.getElementById('pName').value.trim();
    const price = parseFloat(document.getElementById('pPrice').value);
    const category = document.getElementById('pCategory').value;
    const subcat = document.getElementById('pSubcat').value.trim();
    const badge = document.getElementById('pBadge').value.trim();
    const badgeType = document.getElementById('pBadgeType').value;
    const image = document.getElementById('pImage').value.trim();
    const link = document.getElementById('pLink').value.trim();

    if (!name || isNaN(price)) {
      alert("Name and Price are required!");
      return;
    }

    if (id) {
      // Edit
      const pIndex = products.findIndex(p => p.id == id);
      if (pIndex !== -1) {
        products[pIndex] = { ...products[pIndex], name, price, category, subcat, badge, badgeType, image, link };
      }
    } else {
      // Add
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      products.push({ id: newId, name, price, category, subcat, badge, badgeType, order: newId, image: image || 'images/prod_vase.png', link });
    }

    productForm.classList.add('hidden');
    renderProductsTable();
  });

  function renderProductsTable() {
    const tbody = document.getElementById('productsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td><strong>${p.name}</strong><br><small style="color:var(--muted)">${p.subcat || ''}</small></td>
        <td><span class="status-badge draft">${p.category}</span></td>
        <td>$${p.price}</td>
        <td>${p.badge ? `<span class="status-badge published">${p.badge}</span>` : '—'}</td>
        <td class="tbl-actions">
          <button class="admin-btn ghost sm edit-p-btn" data-id="${p.id}">Edit</button>
          <button class="admin-btn danger sm delete-p-btn" data-id="${p.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Add Edit/Delete listeners
    tbody.querySelectorAll('.edit-p-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const p = products.find(prod => prod.id == pId);
        if (p) {
          document.getElementById('productFormTitle').textContent = "Edit Product";
          document.getElementById('pId').value = p.id;
          document.getElementById('pName').value = p.name;
          document.getElementById('pPrice').value = p.price;
          document.getElementById('pCategory').value = p.category;
          document.getElementById('pSubcat').value = p.subcat || '';
          document.getElementById('pBadge').value = p.badge || '';
          document.getElementById('pBadgeType').value = p.badgeType || '';
          document.getElementById('pImage').value = p.image || '';
          document.getElementById('pLink').value = p.link || 'product.html';
          productForm.classList.remove('hidden');
          productForm.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    tbody.querySelectorAll('.delete-p-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this product?")) {
          products = products.filter(prod => prod.id != pId);
          renderProductsTable();
        }
      });
    });
  }

  // Downloader utility
  function triggerDownload(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById('downloadProductsBtn')?.addEventListener('click', () => {
    triggerDownload('products.json', products);
  });


  // 📝 BLOG POSTS MANAGEMENT
  const addPostBtn = document.getElementById('addPostBtn');
  const postForm   = document.getElementById('postForm');
  const cancelPostBtn = document.getElementById('cancelPostBtn');
  const savePostBtn   = document.getElementById('savePostBtn');

  addPostBtn.addEventListener('click', () => {
    document.getElementById('postFormTitle').textContent = "New Blog Post";
    clearPostForm();
    postForm.classList.remove('hidden');
  });

  cancelPostBtn.addEventListener('click', () => {
    postForm.classList.add('hidden');
    clearPostForm();
  });

  function clearPostForm() {
    document.getElementById('postId').value = "";
    document.getElementById('postTitle').value = "";
    document.getElementById('postCategory').value = "home-decor";
    document.getElementById('postStatus').value = "published";
    document.getElementById('postDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('postImage').value = "images/cat_home_decor.png";
    document.getElementById('postExcerpt').value = "";
    document.getElementById('postBody').value = "";
  }

  savePostBtn.addEventListener('click', () => {
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const status = document.getElementById('postStatus').value;
    const date = document.getElementById('postDate').value;
    const image = document.getElementById('postImage').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const body = document.getElementById('postBody').value.trim();

    if (!title || !body) {
      alert("Title and Body Content are required!");
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (id) {
      // Edit
      const pIndex = posts.findIndex(p => p.id == id);
      if (pIndex !== -1) {
        posts[pIndex] = { ...posts[pIndex], title, category, status, date, image, excerpt, body, slug };
      }
    } else {
      // Add
      const newId = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
      posts.push({ id: newId, title, category, status, date, image, excerpt, body, slug });
    }

    postForm.classList.add('hidden');
    renderPostsTable();
  });

  function renderPostsTable() {
    const tbody = document.getElementById('postsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    posts.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td><strong>${p.title}</strong><br><small style="color:var(--muted)">slug: ${p.slug || ''}</small></td>
        <td>${p.category}</td>
        <td><span class="status-badge ${p.status}">${p.status}</span></td>
        <td>${p.date}</td>
        <td class="tbl-actions">
          <button class="admin-btn ghost sm edit-post-btn" data-id="${p.id}">Edit</button>
          <button class="admin-btn danger sm delete-post-btn" data-id="${p.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const p = posts.find(post => post.id == pId);
        if (p) {
          document.getElementById('postFormTitle').textContent = "Edit Blog Post";
          document.getElementById('postId').value = p.id;
          document.getElementById('postTitle').value = p.title;
          document.getElementById('postCategory').value = p.category;
          document.getElementById('postStatus').value = p.status;
          document.getElementById('postDate').value = p.date;
          document.getElementById('postImage').value = p.image || '';
          document.getElementById('postExcerpt').value = p.excerpt || '';
          document.getElementById('postBody').value = p.body || '';
          postForm.classList.remove('hidden');
          postForm.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    tbody.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this blog post?")) {
          posts = posts.filter(post => post.id != pId);
          renderPostsTable();
        }
      });
    });
  }

  document.getElementById('downloadPostsBtn')?.addEventListener('click', () => {
    triggerDownload('posts.json', posts);
  });


  // 💬 CONTACT MESSAGES LOGGING
  const saveContactBtn = document.getElementById('saveContactBtn');
  saveContactBtn?.addEventListener('click', () => {
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const message = document.getElementById('cMsg').value.trim();

    if (!name || !email || !message) {
      alert("All fields are required!");
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    contacts.push({ name, email, message, date });
    localStorage.setItem('ab_contacts', JSON.stringify(contacts));

    document.getElementById('cName').value = '';
    document.getElementById('cEmail').value = '';
    document.getElementById('cMsg').value = '';

    renderContactsTable();
    updateBadges();
  });

  function renderContactsTable() {
    const tbody = document.getElementById('contactsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (contacts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted)">No message entries saved.</td></tr>`;
      return;
    }

    contacts.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.name}</strong></td>
        <td><a href="mailto:${c.email}">${c.email}</a></td>
        <td>${c.message}</td>
        <td>${c.date}</td>
        <td><button class="admin-btn danger sm delete-contact-btn" data-index="${idx}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (confirm("Delete this contact record?")) {
          contacts.splice(idx, 1);
          localStorage.setItem('ab_contacts', JSON.stringify(contacts));
          renderContactsTable();
          updateBadges();
        }
      });
    });
  }


  // 📧 SUBSCRIBERS
  const addSubBtn = document.getElementById('addSubBtn');
  addSubBtn?.addEventListener('click', () => {
    const email = document.getElementById('subEmail').value.trim();
    if (!email) return;

    if (subscribers.some(s => s.email === email)) {
      alert("Email already subscribed!");
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    subscribers.push({ email, date });
    localStorage.setItem('ab_subscribers', JSON.stringify(subscribers));

    document.getElementById('subEmail').value = '';
    renderSubscribersTable();
    updateBadges();
  });

  function renderSubscribersTable() {
    const tbody = document.getElementById('subsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (subscribers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted)">No subscribers found.</td></tr>`;
      return;
    }

    subscribers.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${s.email}</strong></td>
        <td>${s.date}</td>
        <td><button class="admin-btn danger sm delete-sub-btn" data-index="${idx}">Remove</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (confirm("Remove subscriber?")) {
          subscribers.splice(idx, 1);
          localStorage.setItem('ab_subscribers', JSON.stringify(subscribers));
          renderSubscribersTable();
          updateBadges();
        }
      });
    });
  }

  // Export Subscribers to CSV
  document.getElementById('downloadSubsBtn')?.addEventListener('click', () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export!");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Email,Date Added\n";
    subscribers.forEach(s => {
      csvContent += `"${s.email}","${s.date}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aesthetic_bee_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });


  // ⚙️ THEME & SETTINGS
  const sAccentPicker = document.getElementById('sAccentPicker');
  const sAccentHex    = document.getElementById('sAccentHex');

  sAccentPicker?.addEventListener('input', () => {
    sAccentHex.value = sAccentPicker.value.toUpperCase();
  });

  sAccentHex?.addEventListener('input', () => {
    const val = sAccentHex.value.trim();
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      sAccentPicker.value = val;
    }
  });

  function populateSettingsForm() {
    document.getElementById('sSiteName').value = settings.siteName || '';
    document.getElementById('sTagline').value = settings.tagline || '';
    document.getElementById('sEmail').value = settings.email || '';
    document.getElementById('sFormspree').value = settings.formspree || '';
    document.getElementById('sNewsletter').value = settings.newsletterText || '';
    document.getElementById('sDisclosure').value = settings.footerDisclosure || '';

    const color = settings.accentColor || '#C97B4A';
    sAccentPicker.value = color;
    sAccentHex.value = color;
  }

  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    settings.siteName = document.getElementById('sSiteName').value.trim();
    settings.tagline = document.getElementById('sTagline').value.trim();
    settings.email = document.getElementById('sEmail').value.trim();
    settings.formspree = document.getElementById('sFormspree').value.trim();
    settings.accentColor = sAccentHex.value.trim();
    settings.newsletterText = document.getElementById('sNewsletter').value.trim();
    settings.footerDisclosure = document.getElementById('sDisclosure').value.trim();

    alert("Settings saved in memory. Download settings.json to save permanently!");
  });

  document.getElementById('downloadSettingsBtn')?.addEventListener('click', () => {
    triggerDownload('settings.json', settings);
  });

  // Admin PIN Change utility (stored in localStorage, default fallback to CORRECT_PIN)
  document.getElementById('changePinBtn')?.addEventListener('click', () => {
    const oldPinVal = document.getElementById('oldPin').value;
    const newPinVal = document.getElementById('newPin').value;
    const msg = document.getElementById('pinChangeMsg');

    const currentSavedPin = localStorage.getItem('ab_admin_pin') || CORRECT_PIN;

    if (oldPinVal !== currentSavedPin) {
      msg.textContent = "Current PIN is incorrect.";
      msg.style.color = "var(--danger)";
      return;
    }

    if (newPinVal.length < 4) {
      msg.textContent = "New PIN must be at least 4 digits.";
      msg.style.color = "var(--danger)";
      return;
    }

    localStorage.setItem('ab_admin_pin', newPinVal);
    msg.textContent = "Admin PIN updated successfully!";
    msg.style.color = "var(--green)";

    document.getElementById('oldPin').value = '';
    document.getElementById('newPin').value = '';
  });
});
