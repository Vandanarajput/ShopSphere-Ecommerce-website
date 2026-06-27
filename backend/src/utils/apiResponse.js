function success(message, data = {}) {
  return { success: true, message, data };
}

function failure(message, errors) {
  const body = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return body;
}

module.exports = { success, failure };
