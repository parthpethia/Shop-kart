/**
 * Quick API test for Order endpoints (without Razorpay)
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
      if (res.headers['set-cookie']) {
        cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log('=== ShopKart Order API Tests ===\n');

  // Login
  console.log('1. Login...');
  let res = await req('POST', '/customers/login', {
    email: 'apitest@shopkart.com',
    password: 'password123',
  });
  console.log(`   ${res.status === 200 ? '✓' : '✗'} Status: ${res.status}`);

  // Get products
  res = await req('GET', '/products');
  const pid = res.data.products[0]._id;

  // Add product to cart
  console.log('2. Add to cart...');
  res = await req('POST', `/cart/${pid}`);
  console.log(`   ${res.status === 200 ? '✓' : '✗'} Cart has ${res.data.cart?.length} item(s)`);

  // Test empty cart order (clear cart first then try)
  console.log('\n--- ORDER TESTS ---\n');

  // Test: order without auth
  const savedCookie = cookie;
  cookie = '';
  console.log('3. Order without auth...');
  res = await req('POST', '/orders/create-payment-order', { shippingAddress: {} });
  console.log(`   ${res.status === 401 ? '✓' : '✗'} Status: ${res.status}`);
  cookie = savedCookie;

  // Test: missing shipping fields
  console.log('4. Order with empty shipping...');
  res = await req('POST', '/orders/create-payment-order', { shippingAddress: {} });
  console.log(`   ${res.status === 400 ? '✓' : '✗'} Status: ${res.status} — ${res.data.message}`);

  // Test: invalid pincode
  console.log('5. Order with bad pincode...');
  res = await req('POST', '/orders/create-payment-order', {
    shippingAddress: {
      fullName: 'Test', phone: '9876543210',
      addressLine1: '123 Main', city: 'Delhi', state: 'Delhi', pincode: '123'
    }
  });
  console.log(`   ${res.status === 400 ? '✓' : '✗'} Status: ${res.status} — ${res.data.message}`);

  // Test: valid order (will fail on Razorpay if keys are placeholders, which is expected)
  console.log('6. Create payment order (valid shipping)...');
  res = await req('POST', '/orders/create-payment-order', {
    shippingAddress: {
      fullName: 'Test User', phone: '9876543210',
      addressLine1: '22 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001'
    }
  });
  if (res.status === 201) {
    console.log(`   ✓ Order created! ShopKart ID: ${res.data.shopKartOrderId}`);
    console.log(`   ✓ Razorpay Order: ${res.data.razorpayOrderId}`);
    console.log(`   ✓ Amount (paise): ${res.data.amount}`);
  } else {
    console.log(`   → Status: ${res.status} — ${res.data.message}`);
    if (res.data.message?.includes('RAZORPAY') || res.data.error?.includes('key')) {
      console.log('   ℹ  Expected — Razorpay placeholder keys. Replace in backend/.env');
    }
  }

  // Test: Get orders
  console.log('7. Get orders...');
  res = await req('GET', '/orders');
  console.log(`   ${res.status === 200 ? '✓' : '✗'} Status: ${res.status} — ${res.data.orders?.length || 0} orders`);

  // Test: verify payment with fake signature
  console.log('8. Fake payment verification...');
  res = await req('POST', '/orders/verify-payment', {
    shopKartOrderId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    razorpay_order_id: 'order_fake',
    razorpay_payment_id: 'pay_fake',
    razorpay_signature: 'fake_sig'
  });
  console.log(`   ${res.status === 404 || res.status === 400 ? '✓' : '✗'} Status: ${res.status} — ${res.data.message}`);

  // Check cart is still intact (should not be cleared since payment wasn't verified)
  console.log('9. Cart still intact?...');
  res = await req('GET', '/cart');
  console.log(`   ${res.data.cart?.length > 0 ? '✓ Cart preserved' : '✗ Cart was cleared'}`);

  console.log('\n=== TESTS COMPLETE ===');
  console.log('\n⚠️  To test the full Razorpay payment flow:');
  console.log('   1. Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
  console.log('   2. Restart the backend server');
  console.log('   3. Login → Add to Cart → Checkout → Pay with Razorpay Test Card');
}

run().catch(console.error);
