import connectToMongoDB from '../../../../../services/DB/connectMongoDB';
import User from '../../../../../services/models/user';

export default async function handler(req, res) {
  await connectToMongoDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find(); // Only return safe fields
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
