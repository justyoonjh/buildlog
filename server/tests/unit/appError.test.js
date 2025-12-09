const request = require('supertest');
// We need to export app from server-proxy.js to test it, 
// OR we can just test the services functionality first.
// For now, let's create a simple unit test for utils.

const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('should create an error with status fail for 4xx code', () => {
    const err = new AppError('Test Error', 400);
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
  });

  it('should create an error with status error for 5xx code', () => {
    const err = new AppError('Server Error', 500);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });
});
