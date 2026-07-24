import express, { Request, Response } from 'express';
import { User, LoginActivity } from './models';

const router = express.Router();

// Middleware to check admin role
const isAdmin = (req: Request, res: Response, next: Function) => {
  const role = (req as any).role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, {
      id: 1,
      fullName: 1,
      email: 1,
      profilePicture: 1,
      accountStatus: 1,
      loginCount: 1,
      createdAt: 1,
      lastLoginAt: 1,
      role: 1
    }).sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:userId', isAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Block/Unblock user
router.put('/users/:userId/status', isAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findOneAndUpdate(
      { id: req.params.userId },
      { accountStatus: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:userId', isAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete user's activities
    await LoginActivity.deleteMany({ userId: req.params.userId });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all login activities
router.get('/activities', isAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, country, status, startDate, endDate, limit = 100, skip = 0 } = req.query;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (country) filter.country = country;
    if (status) filter.loginStatus = status;

    if (startDate || endDate) {
      filter.loginDate = {};
      if (startDate) filter.loginDate.$gte = new Date(startDate as string);
      if (endDate) filter.loginDate.$lte = new Date(endDate as string);
    }

    const activities = await LoginActivity.find(filter)
      .sort({ loginDate: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await LoginActivity.countDocuments(filter);

    res.json({ activities, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get user's login history
router.get('/activities/user/:userId', isAdmin, async (req: Request, res: Response) => {
  try {
    const activities = await LoginActivity.find({ userId: req.params.userId })
      .sort({ loginDate: -1 })
      .limit(50);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// Get dashboard analytics
router.get('/analytics/dashboard', isAdmin, async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsersToday = await User.countDocuments({
      lastLoginAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1))
      }
    });

    const todayLogins = await LoginActivity.countDocuments({
      loginDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      loginStatus: 'success'
    });

    const failedLogins = await LoginActivity.countDocuments({
      loginStatus: 'failed'
    });

    const onlineUsers = await LoginActivity.distinct('userId', {
      logoutTime: null,
      loginStatus: 'success'
    });

    res.json({
      totalUsers,
      activeUsersToday,
      newUsersThisMonth,
      todayLogins,
      failedLogins,
      onlineUsers: onlineUsers.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get daily login chart data
router.get('/analytics/daily-logins', isAdmin, async (req: Request, res: Response) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const data = await LoginActivity.aggregate([
      {
        $match: {
          loginDate: { $gte: last30Days },
          loginStatus: 'success'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$loginDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily login data' });
  }
});

// Get user growth chart data
router.get('/analytics/user-growth', isAdmin, async (req: Request, res: Response) => {
  try {
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
});

// Get login status breakdown
router.get('/analytics/login-status', isAdmin, async (req: Request, res: Response) => {
  try {
    const data = await LoginActivity.aggregate([
      {
        $group: {
          _id: '$loginStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login status data' });
  }
});

// Get top countries
router.get('/analytics/top-countries', isAdmin, async (req: Request, res: Response) => {
  try {
    const data = await LoginActivity.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top countries' });
  }
});

export default router;
