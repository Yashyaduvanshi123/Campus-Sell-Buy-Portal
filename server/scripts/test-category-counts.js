const { pool } = require('../config/db');

function formatProductCount(count) {
  const num = parseInt(count, 10);
  if (isNaN(num) || num <= 0) {
    return 'No items yet';
  }
  if (num === 1) {
    return '1 item';
  }
  if (num <= 50) {
    return `${num} items`;
  }
  return '50+ items';
}

async function runTests() {
  console.log('--- Testing formatProductCount conditions ---');
  const testCases = [
    { input: 0, expected: 'No items yet' },
    { input: 1, expected: '1 item' },
    { input: 12, expected: '12 items' },
    { input: 35, expected: '35 items' },
    { input: 50, expected: '50 items' },
    { input: 51, expected: '50+ items' },
    { input: 120, expected: '50+ items' },
    { input: 340, expected: '50+ items' },
    { input: null, expected: 'No items yet' },
    { input: undefined, expected: 'No items yet' }
  ];

  let passed = 0;
  for (const tc of testCases) {
    const res = formatProductCount(tc.input);
    const ok = res === tc.expected;
    console.log(`Input: ${tc.input} => Output: "${res}" | Expected: "${tc.expected}" | ${ok ? '✅ PASS' : '❌ FAIL'}`);
    if (ok) passed++;
  }

  console.log(`\nCondition Tests: ${passed}/${testCases.length} passed.`);

  console.log('\n--- Testing database category product count query ---');
  const query = `
    SELECT 
      c.*,
      CAST(COUNT(CASE WHEN p.status = 'active' THEN p.id END) AS UNSIGNED) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
  const [categories] = await pool.query(query);
  for (const cat of categories) {
    console.log(`Category: ${cat.name} (${cat.slug}) => DB Count: ${cat.product_count} => Display: "${formatProductCount(cat.product_count)}"`);
  }

  // Test dynamic change: mark a product as sold, check count, restore product
  console.log('\n--- Testing dynamic status change on database counts ---');
  const [elecBefore] = await pool.query(`
    SELECT COUNT(CASE WHEN p.status = 'active' THEN p.id END) AS count 
    FROM products p WHERE p.category_id = 1
  `);
  console.log(`Initial active Electronics count: ${elecBefore[0].count}`);

  await pool.query("UPDATE products SET status = 'sold' WHERE id = 1");
  const [elecSold] = await pool.query(`
    SELECT COUNT(CASE WHEN p.status = 'active' THEN p.id END) AS count 
    FROM products p WHERE p.category_id = 1
  `);
  console.log(`Active Electronics count after marking 1 item sold: ${elecSold[0].count} => "${formatProductCount(elecSold[0].count)}"`);

  // Restore
  await pool.query("UPDATE products SET status = 'active' WHERE id = 1");
  const [elecRestored] = await pool.query(`
    SELECT COUNT(CASE WHEN p.status = 'active' THEN p.id END) AS count 
    FROM products p WHERE p.category_id = 1
  `);
  console.log(`Active Electronics count after restoring to active: ${elecRestored[0].count} => "${formatProductCount(elecRestored[0].count)}"`);

  await pool.end();
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
