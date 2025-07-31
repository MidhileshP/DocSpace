import request from 'supertest';
import app from '../app.js';

describe('Document API', () => {
  it('should return 401 for unauthorized access to /api/docs', async () => {
    const res = await request(app).get('/api/docs');
    expect(res.statusCode).toEqual(401);
  });
}); 