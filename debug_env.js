// Debug script to check all environment variables
console.log('=== All Environment Variables ===');
console.log('import.meta.env:', import.meta.env);
console.log('All VITE_ variables:');
Object.keys(import.meta.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    console.log(`${key}: ${import.meta.env[key]}`);
  }
});
console.log('=====================================');