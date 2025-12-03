import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/database.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
  constructor() {
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        this.purchases = parsed.purchases || [];
        this.accessCodes = parsed.accessCodes || [];
        this.emailConfig = parsed.emailConfig || null;
      } else {
        this.purchases = [];
        this.accessCodes = [];
        this.emailConfig = null;
        this.save();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.purchases = [];
      this.accessCodes = [];
      this.emailConfig = null;
    }
  }

  save() {
    try {
      const data = {
        purchases: this.purchases,
        accessCodes: this.accessCodes,
        emailConfig: this.emailConfig,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Purchase methods
  createPurchase(purchaseData) {
    const purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...purchaseData,
      createdAt: new Date().toISOString(),
    };
    this.purchases.push(purchase);
    this.save();
    return purchase;
  }

  getPurchase(purchaseId) {
    return this.purchases.find(p => p.id === purchaseId);
  }

  getAllPurchases() {
    return this.purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Access code methods
  createAccessCode(accessCodeData) {
    const accessCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...accessCodeData,
      createdAt: new Date().toISOString(),
    };
    this.accessCodes.push(accessCode);
    this.save();
    return accessCode;
  }

  getAccessCode(accessCodeId) {
    return this.accessCodes.find(c => c.id === accessCodeId);
  }

  getAccessCodesByPurchase(purchaseId) {
    return this.accessCodes.filter(c => c.purchaseId === purchaseId);
  }

  getAllAccessCodes() {
    return this.accessCodes;
  }

  // Get active access codes (currently valid)
  getActiveAccessCodes() {
    const now = new Date();
    return this.accessCodes.filter(code => {
      const startsAt = new Date(code.startsAt);
      const endsAt = new Date(code.endsAt);
      // Code is active if current time is >= start time AND <= end time
      const isActive = now >= startsAt && now <= endsAt;
      return isActive;
    });
  }

  // Get access codes by date
  getAccessCodesByDate(dateString) {
    return this.accessCodes.filter(code => {
      const codeDate = code.date || new Date(code.startsAt).toISOString().split('T')[0];
      return codeDate === dateString;
    });
  }

  // Get all people with access (active codes)
  getPeopleWithAccess() {
    const now = new Date();
    const activeCodes = this.accessCodes.filter(code => {
      const startsAt = new Date(code.startsAt);
      const endsAt = new Date(code.endsAt);
      // Code is active if current time is >= start time AND <= end time
      return now >= startsAt && now <= endsAt;
    });
    
    const peopleMap = new Map();

    activeCodes.forEach(code => {
      const key = `${code.customerEmail}_${code.date}`;
      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name: code.customerName,
          email: code.customerEmail,
          phone: code.customerPhone,
          date: code.date,
          accessCodes: [],
          purchaseId: code.purchaseId,
          startsAt: code.startsAt,
          endsAt: code.endsAt,
        });
      }
      peopleMap.get(key).accessCodes.push({
        pinCode: code.pinCode,
        accessCodeId: code.id,
      });
    });

    return Array.from(peopleMap.values());
  }

  // Email config methods
  setEmailConfig(config) {
    this.emailConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.emailConfig;
  }

  getEmailConfig() {
    return this.emailConfig;
  }

  // Clear all data
  clearAll() {
    const purchaseCount = this.purchases.length;
    const accessCodeCount = this.accessCodes.length;
    
    this.purchases = [];
    this.accessCodes = [];
    // Keep email config - don't delete that
    this.save();
    
    return {
      purchasesDeleted: purchaseCount,
      accessCodesDeleted: accessCodeCount,
    };
  }
}

export default new Database();
