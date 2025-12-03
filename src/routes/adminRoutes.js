import express from 'express';
import database from '../models/database.js';

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Get dashboard data with active access codes and people
 */
router.get('/dashboard', async (req, res) => {
  try {
    const allPurchases = database.getAllPurchases();
    const allAccessCodes = database.getAllAccessCodes();
    const activeAccessCodes = database.getActiveAccessCodes();
    const peopleWithAccess = database.getPeopleWithAccess();

    // Get today's date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    const todayAccessCodes = database.getAccessCodesByDate(todayStr);

    // Statistics
    const stats = {
      totalPurchases: allPurchases.length,
      totalAccessCodes: allAccessCodes.length,
      activeAccessCodes: activeAccessCodes.length,
      peopleWithAccess: peopleWithAccess.length,
      todayAccessCodes: todayAccessCodes.length,
      totalRevenue: allPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    };

    res.json({
      success: true,
      stats,
      activePeople: peopleWithAccess,
      activeAccessCodes: activeAccessCodes.map(code => ({
        id: code.id,
        customerName: code.customerName,
        customerEmail: code.customerEmail,
        customerPhone: code.customerPhone,
        pinCode: code.pinCode,
        date: code.date,
        startsAt: code.startsAt,
        endsAt: code.endsAt,
        purchaseId: code.purchaseId,
      })),
      recentPurchases: allPurchases.slice(0, 10).map(p => ({
        id: p.id,
        type: p.type,
        selectedDates: p.selectedDates,
        totalAdults: p.totalAdults,
        children: p.children,
        totalAmount: p.totalAmount,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/people
 * Get list of all people with access codes (active and past)
 */
router.get('/people', async (req, res) => {
  try {
    const { activeOnly, date } = req.query;
    
    let accessCodes = database.getAllAccessCodes();
    
    // Filter by date if provided
    if (date) {
      accessCodes = database.getAccessCodesByDate(date);
    }
    
    // Filter active only if requested
    if (activeOnly === 'true') {
      accessCodes = database.getActiveAccessCodes();
    }

    // Use a single "now" timestamp for consistent comparison
    const now = new Date();
    
    // Group by person
    const peopleMap = new Map();
    
    accessCodes.forEach(code => {
      const key = `${code.customerEmail}_${code.date || 'all'}`;
      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name: code.customerName,
          email: code.customerEmail,
          phone: code.customerPhone,
          dates: [],
          accessCodes: [],
          purchases: [],
        });
      }
      
      const person = peopleMap.get(key);
      if (!person.dates.includes(code.date)) {
        person.dates.push(code.date);
      }
      
      const start = new Date(code.startsAt);
      const end = new Date(code.endsAt);
      // Code is active if current time is >= start time AND <= end time
      const isActive = now >= start && now <= end;
      
      person.accessCodes.push({
        id: code.id,
        pinCode: code.pinCode,
        date: code.date,
        startsAt: code.startsAt,
        endsAt: code.endsAt,
        isActive: isActive,
        purchaseId: code.purchaseId,
      });
      
      if (!person.purchases.includes(code.purchaseId)) {
        person.purchases.push(code.purchaseId);
      }
    });

    const people = Array.from(peopleMap.values()).map(person => ({
      ...person,
      dates: person.dates.sort(),
      totalCodes: person.accessCodes.length,
      activeCodes: person.accessCodes.filter(c => c.isActive).length,
    }));

    res.json({
      success: true,
      people: people.sort((a, b) => b.dates[0]?.localeCompare(a.dates[0] || '') || 0),
      total: people.length,
    });
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/access-codes
 * Get all access codes with filters
 */
router.get('/access-codes', async (req, res) => {
  try {
    const { activeOnly, date, purchaseId } = req.query;
    
    let codes = database.getAllAccessCodes();
    
    if (activeOnly === 'true') {
      codes = database.getActiveAccessCodes();
    }
    
    if (date) {
      codes = codes.filter(c => {
        const codeDate = c.date || new Date(c.startsAt).toISOString().split('T')[0];
        return codeDate === date;
      });
    }
    
    if (purchaseId) {
      codes = codes.filter(c => c.purchaseId === purchaseId);
    }

    // Use a single "now" timestamp for consistent comparison
    const now = new Date();
    
    res.json({
      success: true,
      accessCodes: codes.map(code => {
        const start = new Date(code.startsAt);
        const end = new Date(code.endsAt);
        // Code is active if current time is >= start time AND <= end time
        const isActive = now >= start && now <= end;
        
        return {
          id: code.id,
          customerName: code.customerName,
          customerEmail: code.customerEmail,
          customerPhone: code.customerPhone,
          pinCode: code.pinCode,
          date: code.date,
          startsAt: code.startsAt,
          endsAt: code.endsAt,
          isActive: isActive,
          purchaseId: code.purchaseId,
          createdAt: code.createdAt,
        };
      }),
      total: codes.length,
    });
  } catch (error) {
    console.error('Error fetching access codes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/clear-all
 * Clear all data from the database (purchases and access codes)
 */
router.delete('/clear-all', async (req, res) => {
  try {
    // Clear all purchases and access codes (keeps email config)
    const result = database.clearAll();
    
    res.json({
      success: true,
      message: 'All data has been cleared from the database',
      deleted: result,
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

