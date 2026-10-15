/**
 * Quick API test script for Wishlist + Cart
 * Run: node backend/test-apis.js
 */
const http = require('http');

const BASE = 'http://localhost:5000';
let cookie = '';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };
    const r = http.request(options, (res) => {
      // Capture set-cookie
      if (res.headers['set-cookie']) {
        cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log('=== ShopKart Wishlist + Cart API Tests ===\n');

  // 1. Register/Login
  console.log('1. Register test user...');
  let res = await req('POST', '/customers/register', {
    fullName: 'Test User',
    email: 'apitest@shopkart.com',
    password: 'password123',
    phone: '9876543210',
  });
  console.log(`   Status: ${res.status} ${res.status === 201 ? '✓ Created' : res.status === 409 ? '→ Already exists' : ''}`);

  console.log('2. Login...');
  res = await req('POST', '/customers/login', {
    email: 'apitest@shopkart.com',
    password: 'password123',
  });
  console.log(`   Status: ${res.status} ${res.status === 200 ? '✓ Logged in' : '✗ Failed'}`);
  if (res.status !== 200) { console.log('   Cannot continue without login.'); return; }

  // 3. Get products to get a valid product ID
  console.log('3. Get products...');
  res = await req('GET', '/products');
  const products = res.data.products || [];
  console.log(`   Status: ${res.status} ✓ Got ${products.length} products`);
  if (products.length === 0) { console.log('   No products to test with.'); return; }

  const pid1 = products[0]._id;
  const pid2 = products.length > 1 ? products[1]._id : pid1;
  console.log(`   Using product: ${products[0].name} (${pid1})`);

  // === WISHLIST TESTS ===
  console.log('\n--- WISHLIST TESTS ---\n');

  console.log('4. Add to wishlist...');
  res = await req('POST', `/wishlist/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 200 ? '✓' : res.status === 409 ? '→ Already added' : '✗'} ${res.data.message}`);

  console.log('5. Add duplicate...');
  res = await req('POST', `/wishlist/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 409 ? '✓ Correctly rejected' : '✗ Should be 409'}`);

  console.log('6. Get wishlist...');
  res = await req('GET', '/wishlist');
  console.log(`   Status: ${res.status} ✓ Wishlist count: ${res.data.count}`);
  if (res.data.wishlist && res.data.wishlist[0]) {
    console.log(`   First item: ${res.data.wishlist[0].name} — ₹${res.data.wishlist[0].price}`);
  }

  console.log('7. Toggle wishlist (remove)...');
  res = await req('PATCH', `/wishlist/${pid1}/toggle`);
  console.log(`   Status: ${res.status} saved=${res.data.saved} ${!res.data.saved ? '✓ Removed' : '✗'}`);

  console.log('8. Toggle wishlist (add back)...');
  res = await req('PATCH', `/wishlist/${pid1}/toggle`);
  console.log(`   Status: ${res.status} saved=${res.data.saved} ${res.data.saved ? '✓ Added' : '✗'}`);

  console.log('9. Remove from wishlist...');
  res = await req('DELETE', `/wishlist/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 200 ? '✓ Removed' : '✗'}`);

  console.log('10. Remove non-existent...');
  res = await req('DELETE', `/wishlist/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 404 ? '✓ Correctly 404' : '✗'}`);

  // === CART TESTS ===
  console.log('\n--- CART TESTS ---\n');

  console.log('11. Add to cart...');
  res = await req('POST', `/cart/${pid1}`);
  console.log(`   Status: ${res.status} ✓ Cart has ${res.data.cart?.length} item(s)`);

  console.log('12. Add same product again (should increment qty)...');
  res = await req('POST', `/cart/${pid1}`);
  const cartItem = res.data.cart?.find(i => (i.product?._id || i.product) === pid1);
  console.log(`   Status: ${res.status} ✓ Quantity now: ${cartItem?.quantity}`);

  console.log('13. Add second product...');
  res = await req('POST', `/cart/${pid2}`);
  console.log(`   Status: ${res.status} ✓ Cart has ${res.data.cart?.length} item(s)`);

  console.log('14. Get cart (populated)...');
  res = await req('GET', '/cart');
  console.log(`   Status: ${res.status} ✓ Cart items: ${res.data.cart?.length}`);
  for (const item of (res.data.cart || [])) {
    console.log(`   → ${item.product?.name} × ${item.quantity} = ₹${(item.product?.price || 0) * item.quantity}`);
  }

  console.log('15. Update quantity to 3...');
  res = await req('PATCH', `/cart/${pid1}`, { quantity: 3 });
  console.log(`   Status: ${res.status} ${res.status === 200 ? '✓ Updated' : '✗'}`);

  console.log('16. Update quantity to 0 (should fail)...');
  res = await req('PATCH', `/cart/${pid1}`, { quantity: 0 });
  console.log(`   Status: ${res.status} ${res.status === 400 ? '✓ Correctly rejected' : '✗'}`);

  console.log('17. Update quantity above stock (should fail)...');
  res = await req('PATCH', `/cart/${pid1}`, { quantity: 9999 });
  console.log(`   Status: ${res.status} ${res.status === 400 ? '✓ Correctly rejected' : '✗'}`);

  console.log('18. Remove from cart...');
  res = await req('DELETE', `/cart/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 200 ? '✓ Removed' : '✗'} Cart now: ${res.data.cart?.length} item(s)`);

  console.log('19. Remove non-existent...');
  res = await req('DELETE', `/cart/${pid1}`);
  console.log(`   Status: ${res.status} ${res.status === 404 ? '✓ Correctly 404' : '✗'}`);

  // === UNAUTHENTICATED TESTS ===
  console.log('\n--- AUTH TESTS ---\n');

  const savedCookie = cookie;
  cookie = ''; // Clear auth

  console.log('20. Wishlist without auth...');
  res = await req('GET', '/wishlist');
  console.log(`   Status: ${res.status} ${res.status === 401 ? '✓ Correctly 401' : '✗'}`);

  console.log('21. Cart without auth...');
  res = await req('GET', '/cart');
  console.log(`   Status: ${res.status} ${res.status === 401 ? '✓ Correctly 401' : '✗'}`);

  console.log('\n=== ALL TESTS COMPLETE ===');
}

run().catch(console.error);
