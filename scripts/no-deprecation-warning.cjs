// Suppress the Node.js v26 DeprecationWarning for module.register()
// This is triggered by Next.js's internal module loading and is not actionable.
const originalEmit = process.emit;
process.emit = function(name, data) {
  if (
    name === 'warning' &&
    data &&
    data.name === 'DeprecationWarning' &&
    typeof data.message === 'string' &&
    data.message.includes('module.register()')
  ) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};