const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

(async () => {
  // Start server
  const app = require('../server');
  const server = app.listen(5001, async () => {
    console.log('🧪 Starting API Verification Suite on port 5001...\n');
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
      try {
        await fn();
        console.log(`✅ PASS: ${name}`);
        passed++;
      } catch (err) {
        console.error(`❌ FAIL: ${name} ->`, err.message);
        failed++;
      }
    };

    let studentToken = '';
    let adminToken = '';
    let createdProductId = null;

    // 1. Health check
    await test('Health check GET /api/health', async () => {
      const res = await request({ port: 5001, path: '/api/health', method: 'GET' });
      if (res.status !== 200 || res.body.status !== 'healthy') throw new Error('Health check failed');
    });

    // 2. Categories
    await test('Categories GET /api/categories', async () => {
      const res = await request({ port: 5001, path: '/api/categories', method: 'GET' });
      if (res.status !== 200 || !res.body.success || res.body.data.length < 8) {
        throw new Error(`Expected at least 8 categories, got ${res.body?.data?.length}`);
      }
    });

    let sampleProductId = 1;
    let sampleTitle = 'HP';

    // 3. Products Browse & Filter
    await test('Products GET /api/products', async () => {
      const res = await request({ port: 5001, path: '/api/products?limit=5', method: 'GET' });
      if (res.status !== 200 || !res.body.success || res.body.data.length === 0) {
        throw new Error('Products browse failed');
      }
      sampleProductId = res.body.data[0].id;
      sampleTitle = res.body.data[0].title.split(' ')[0];
    });

    // 4. Products Search
    await test('Products Search GET /api/products?search=' + sampleTitle, async () => {
      const res = await request({ port: 5001, path: `/api/products?search=${encodeURIComponent(sampleTitle)}`, method: 'GET' });
      if (res.status !== 200 || res.body.data.length === 0) throw new Error('Search failed');
    });

    // 5. Product Details
    await test('Product Details GET /api/products/' + sampleProductId, async () => {
      const res = await request({ port: 5001, path: `/api/products/${sampleProductId}`, method: 'GET' });
      if (res.status !== 200 || !res.body.data.title || !res.body.data.images) {
        throw new Error('Product details failed');
      }
    });

    // 6. Student Login
    await test('Student Login POST /api/auth/login', async () => {
      const res = await request({
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'aarav.sharma@campusmarket.edu', password: 'Student123!' });

      if (res.status !== 200 || !res.body.token) throw new Error(res.body.message || 'Login failed');
      studentToken = res.body.token;
    });

    // 7. Auth verification GET /api/auth/me
    await test('Current User GET /api/auth/me', async () => {
      const res = await request({
        port: 5001,
        path: '/api/auth/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200 || res.body.user.email !== 'aarav.sharma@campusmarket.edu') {
        throw new Error('Auth me check failed');
      }
    });

    // 8. Verify Admin Route Is Completely Disabled
    await test('Admin Routes Inaccessible GET /api/admin/dashboard', async () => {
      const res = await request({
        port: 5001,
        path: '/api/admin/dashboard',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 404) throw new Error(`Expected 404 Not Found for removed admin route, got ${res.status}`);
    });

    // 11. Student Favourites
    await test('Student Favourites GET /api/favourites', async () => {
      const res = await request({
        port: 5001,
        path: '/api/favourites',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200 || !Array.isArray(res.body.data)) throw new Error('Favourites fetch failed');
    });

    // 12. Toggle Favourite
    await test(`Add/Remove Favourite POST /api/favourites/${sampleProductId}`, async () => {
      // Cleanup first in case it was already favourited
      await request({
        port: 5001,
        path: `/api/favourites/${sampleProductId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      const addRes = await request({
        port: 5001,
        path: `/api/favourites/${sampleProductId}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (addRes.status !== 201) throw new Error('Add favourite failed');

      const delRes = await request({
        port: 5001,
        path: `/api/favourites/${sampleProductId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (delRes.status !== 200) throw new Error('Delete favourite failed');
    });

    // 13. Student Inquiries
    await test('Student Inquiries GET /api/inquiries/my', async () => {
      const res = await request({
        port: 5001,
        path: '/api/inquiries/my',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200 || !res.body.data.received || !res.body.data.sent) {
        throw new Error('Inquiries fetch failed');
      }
      const allInquiries = [...res.body.data.received, ...res.body.data.sent];
      if (allInquiries.length > 0) {
        const item = allInquiries[0];
        if (item.product_image === undefined || item.primary_image === undefined) {
          throw new Error('Expected product_image and primary_image to be defined on inquiry object');
        }
      }
    });

    let createdInquiryId = null;

    // 14. Send Inquiry
    await test('Send Inquiry POST /api/inquiries', async () => {
      const res = await request({
        port: 5001,
        path: '/api/inquiries',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }, {
        product_id: 3, // Priya's product, Aarav is inquiring
        message: 'Can we meet at the campus library quad at 4 PM?',
        phone: '+91 98765 43210'
      });
      if (res.status !== 201 || !res.body.inquiryId) throw new Error('Send inquiry failed: ' + JSON.stringify(res.body));
      createdInquiryId = res.body.inquiryId;
    });

    // 14b. View Inquiry Details with Threaded Messages
    await test('View Inquiry Thread GET /api/inquiries/:id', async () => {
      const res = await request({
        port: 5001,
        path: `/api/inquiries/${createdInquiryId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200 || !res.body.data.messages || res.body.data.messages.length === 0) {
        throw new Error('Get inquiry thread failed');
      }
    });

    // 14c. Seller Login & Reply to Inquiry
    await test('Seller Login and Reply POST /api/inquiries/:id/messages', async () => {
      // Login as Priya (Seller of product 3)
      const loginRes = await request({
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'priya.patel@campusmarket.edu', password: 'Student123!' });

      const priyaToken = loginRes.body.token;

      // Priya replies to Aarav's inquiry
      const replyRes = await request({
        port: 5001,
        path: `/api/inquiries/${createdInquiryId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${priyaToken}`,
          'Content-Type': 'application/json'
        }
      }, {
        message: 'Sure Aarav, 4 PM near the library coffee kiosk works great for me!'
      });

      if (replyRes.status !== 201 || replyRes.body.inquiryStatus !== 'replied') {
        throw new Error('Seller reply failed');
      }
    });

    // 14d. Security Test: Unauthorized Student C cannot view or reply
    await test('Security: Unauthorized User Cannot Access Inquiry Thread', async () => {
      // Login as Rohan (Student C, neither buyer nor seller)
      const loginRes = await request({
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'rohan.verma@campusmarket.edu', password: 'Student123!' });

      const rohanToken = loginRes.body.token;

      // Rohan attempts to access Aarav & Priya's private inquiry
      const forbiddenGet = await request({
        port: 5001,
        path: `/api/inquiries/${createdInquiryId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${rohanToken}` }
      });

      if (forbiddenGet.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${forbiddenGet.status}`);
      }

      // Rohan attempts to inject a message into Aarav & Priya's inquiry
      const forbiddenPost = await request({
        port: 5001,
        path: `/api/inquiries/${createdInquiryId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rohanToken}`,
          'Content-Type': 'application/json'
        }
      }, { message: 'Malicious eavesdrop message' });

      if (forbiddenPost.status !== 403) {
        throw new Error(`Expected 403 Forbidden on inject message, got ${forbiddenPost.status}`);
      }
    });

    // 15. Create Product
    await test('Create Product POST /api/products', async () => {
      const res = await request({
        port: 5001,
        path: '/api/products',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }, {
        title: 'Verilog HDL Lab Guide & Notes',
        category_id: 3, // Notes
        price: 180,
        original_price: 350,
        product_condition: 'Like New',
        campus: 'North Campus Hostel 4',
        description: 'Complete verified lab manual with circuit simulations and waveform printouts.'
      });
      if (res.status !== 201 || !res.body.productId) throw new Error('Create product failed');
      createdProductId = res.body.productId;
    });

    // 15b. My Listings Endpoint & Owner Scoping
    await test('My Listings GET /api/products/my/listings', async () => {
      const res = await request({
        port: 5001,
        path: '/api/products/my/listings',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200 || !res.body.success || !Array.isArray(res.body.data)) {
        throw new Error('Failed to fetch user listings');
      }
      if (!res.body.counts || res.body.counts.total === undefined) {
        throw new Error('Expected counts object with total, active, and sold in response');
      }
      const myProduct = res.body.data.find(p => p.id === createdProductId);
      if (!myProduct) {
        throw new Error('Created product not found in user listings');
      }
      // Ensure all listings belong to the authenticated student
      const foreignProduct = res.body.data.find(p => p.seller_id !== myProduct.seller_id);
      if (foreignProduct) {
        throw new Error('Found product not belonging to authenticated student in My Listings');
      }
    });

    // 15c. Prevent Seller from Adding Own Product to Cart
    await test('Prevent Add Own Product to Cart POST /api/cart/:id', async () => {
      const res = await request({
        port: 5001,
        path: `/api/cart/${createdProductId}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 400 || !res.body.message.includes('own')) {
        throw new Error(`Expected 400 error preventing adding own product, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
    });

    // 15d. Unauthorized Student Cannot Edit Another Student's Listing
    await test('Unauthorized Student Edit Blocked PUT /api/products/:id', async () => {
      // Login as Rohan (different student)
      const rohanLogin = await request({
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'rohan.verma@campusmarket.edu', password: 'Student123!' });

      const rohanToken = rohanLogin.body.token;

      const editRes = await request({
        port: 5001,
        path: `/api/products/${createdProductId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${rohanToken}`,
          'Content-Type': 'application/json'
        }
      }, { title: 'Hacked Title By Rohan' });

      if (editRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden on unauthorized edit, got ${editRes.status}`);
      }
    });

    // 16. Mark Product as Sold
    await test('Mark Product Status PATCH /api/products/:id/status', async () => {
      const res = await request({
        port: 5001,
        path: `/api/products/${createdProductId}/status`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      }, { status: 'sold' });
      if (res.status !== 200) throw new Error('Mark as sold failed');
    });

    // 17. Delete Product
    await test('Delete Product DELETE /api/products/:id', async () => {
      const res = await request({
        port: 5001,
        path: `/api/products/${createdProductId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.status !== 200) throw new Error('Delete product failed');
    });

    console.log(`\n==================================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
})();
