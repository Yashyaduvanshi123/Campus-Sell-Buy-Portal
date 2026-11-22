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
  const app = require('../server');
  const server = app.listen(5002, async () => {
    console.log('🧪 Starting Buyer-Seller Contact System & Security Verification on port 5002...\n');
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

    let tokenA = ''; // Aarav (Buyer)
    let tokenB = ''; // Priya (Seller)
    let tokenC = ''; // Rohan (Unauthorized 3rd party)
    let inquiryId = null;

    // 1. Auth Logins
    await test('Login as Student A (Aarav - Buyer)', async () => {
      const res = await request({
        port: 5002,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'aarav.sharma@campusmarket.edu', password: 'Student123!' });
      if (res.status !== 200 || !res.body.token) throw new Error('Login A failed');
      tokenA = res.body.token;
    });

    await test('Login as Student B (Priya - Seller)', async () => {
      const res = await request({
        port: 5002,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'priya.patel@campusmarket.edu', password: 'Student123!' });
      if (res.status !== 200 || !res.body.token) throw new Error('Login B failed');
      tokenB = res.body.token;
    });

    await test('Login as Student C (Rohan - Independent Peer)', async () => {
      const res = await request({
        port: 5002,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'rohan.verma@campusmarket.edu', password: 'Student123!' });
      if (res.status !== 200 || !res.body.token) throw new Error('Login C failed');
      tokenC = res.body.token;
    });

    // 2. Buyer Checks & Self-Contact Prevention
    await test('Buyer Self-Contact Prevention (Cannot contact self)', async () => {
      // Product 1 belongs to Aarav (Student A)
      const res = await request({
        port: 5002,
        path: '/api/inquiries',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'Content-Type': 'application/json'
        }
      }, {
        product_id: 1, // Aarav's own product
        message: 'Trying to contact myself!'
      });

      if (res.status !== 400 || !res.body.message.includes('own product')) {
        throw new Error(`Expected 400 rejection, got ${res.status}: ${JSON.stringify(res.body)}`);
      }
    });

    // 3. Buyer submits inquiry for Student B's product
    await test('Buyer contacts Seller for Product 4 (Hostel Bed Desk)', async () => {
      // Product 4 belongs to Priya (Student B)
      const res = await request({
        port: 5002,
        path: '/api/inquiries',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'Content-Type': 'application/json'
        }
      }, {
        product_id: 4,
        message: 'Hi Priya, I am interested in the foldable bed desk. Can we meet near South Hostel at 5 PM?',
        phone: '+91 98765 43210'
      });

      if (res.status !== 201 || !res.body.inquiryId) {
        throw new Error(`Inquiry creation failed: ${JSON.stringify(res.body)}`);
      }
      inquiryId = res.body.inquiryId;
    });

    // 4. Buyer checks inquiry history
    await test('Buyer sees inquiry in Sent list', async () => {
      const res = await request({
        port: 5002,
        path: '/api/inquiries/my',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      if (res.status !== 200) throw new Error('Fetch inquiries failed');
      const found = res.body.data.sent.find(i => i.id === inquiryId);
      if (!found) throw new Error('Inquiry not found in buyer sent list');
      if (found.product_title !== 'Ergonomic Wooden Foldable Study Bed Desk') {
        throw new Error('Product title mismatch');
      }
    });

    // 5. Seller checks incoming inquiries
    await test('Seller sees inquiry in Received list with unread status', async () => {
      const res = await request({
        port: 5002,
        path: '/api/inquiries/my',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenB}` }
      });

      if (res.status !== 200) throw new Error('Fetch seller inquiries failed');
      const found = res.body.data.received.find(i => i.id === inquiryId);
      if (!found) throw new Error('Inquiry not found in seller received list');
      if (found.buyer_name !== 'Aarav Sharma') throw new Error('Buyer name mismatch');
    });

    // 6. Seller opens inquiry details -> automatically marked as 'read'
    await test('Seller opens inquiry details (auto-marks as read)', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenB}` }
      });

      if (res.status !== 200 || !res.body.data) throw new Error('Open inquiry failed');
      if (res.body.data.status !== 'read') {
        throw new Error(`Expected status 'read', got '${res.body.data.status}'`);
      }
      if (!res.body.data.messages || res.body.data.messages.length < 1) {
        throw new Error('Expected at least 1 message in thread');
      }
    });

    // 7. Seller replies to Buyer
    await test('Seller replies in inquiry thread (status becomes replied)', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenB}`,
          'Content-Type': 'application/json'
        }
      }, {
        message: 'Hi Aarav, 5 PM near South Hostel works perfectly. I will bring the desk.'
      });

      if (res.status !== 201 || res.body.inquiryStatus !== 'replied') {
        throw new Error(`Seller reply failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Buyer replies back in thread
    await test('Buyer replies back in inquiry thread', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'Content-Type': 'application/json'
        }
      }, {
        message: 'Great, see you then! I have exact cash.'
      });

      if (res.status !== 201) throw new Error('Buyer reply back failed');
    });

    // 9. Verify full message thread order
    await test('Conversation thread contains 3 chronological messages', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      if (res.status !== 200) throw new Error('Fetch thread failed');
      const msgs = res.body.data.messages;
      if (msgs.length !== 3) {
        throw new Error(`Expected exactly 3 messages, got ${msgs.length}`);
      }
      // Check chronological order
      if (msgs[0].sender_id !== res.body.data.buyer_id || msgs[1].sender_id !== res.body.data.seller_id) {
        throw new Error('Message order or sender mismatch');
      }
    });

    // 10. Seller marks inquiry as closed
    await test('Seller marks inquiry as closed', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}/status`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokenB}`,
          'Content-Type': 'application/json'
        }
      }, { status: 'closed' });

      if (res.status !== 200 || !res.body.success) throw new Error('Close inquiry failed');
    });

    // 11. Security Test: Unauthorized Student C cannot view thread
    await test('SECURITY: Student C cannot view Student A & B conversation (403)', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenC}` }
      });

      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 12. Security Test: Student C cannot post to Student A & B thread
    await test('SECURITY: Student C cannot post message to inquiry (403)', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenC}`,
          'Content-Type': 'application/json'
        }
      }, { message: 'Unauthorized injection attempt' });

      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 13. Security Test: Unauthenticated guest cannot view or send inquiries
    await test('SECURITY: Unauthenticated guest receives 401 Unauthorized', async () => {
      const res = await request({
        port: 5002,
        path: `/api/inquiries/${inquiryId}`,
        method: 'GET'
      });

      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    // 14. WhatsApp Privacy Check: Product with allow_whatsapp = false hides WhatsApp CTA
    await test('WhatsApp Privacy: Product without opt-in hides WhatsApp link', async () => {
      // Product 4 has allow_whatsapp = false by default
      const res = await request({
        port: 5002,
        path: '/api/products/4',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      if (res.status !== 200) throw new Error('Fetch product 4 failed');
      if (res.body.data.can_whatsapp === true || res.body.data.whatsapp_link !== null) {
        throw new Error('WhatsApp should not be enabled when allow_whatsapp is false');
      }
    });

    // 15. WhatsApp Privacy Check: Product with allow_whatsapp = true generates proper link for auth user
    await test('WhatsApp Privacy: Product with opt-in generates valid WhatsApp link for auth user', async () => {
      // Product 1 has allow_whatsapp = true
      const res = await request({
        port: 5002,
        path: '/api/products/1',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenB}` }
      });

      if (res.status !== 200) throw new Error('Fetch product 1 failed');
      if (res.body.data.can_whatsapp !== true || !res.body.data.whatsapp_link.includes('wa.me')) {
        throw new Error(`Expected valid WhatsApp link, got: ${res.body.data.whatsapp_link}`);
      }
    });

    console.log(`\n==================================================`);
    console.log(`Buyer-Seller Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
})();
