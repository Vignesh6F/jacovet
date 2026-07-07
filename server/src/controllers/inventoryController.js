const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get monthly inventory list
const getInventory = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany();
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ message: 'Failed to retrieve stock list.' });
  }
};

// Restock a single item
const restockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // e.g. quantity: 10

    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: 'Valid restock quantity is required.' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { stock: item.stock + parseInt(quantity) }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: req.user.role === 'admin' ? 'Clinic Admin' : 'Veterinarian',
        action: 'Restock Inventory',
        details: `Restocked ${quantity} units of ${item.name}. New level: ${updated.stock}.`
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error restocking item:', error);
    return res.status(500).json({ message: 'Failed to restock inventory item.' });
  }
};

// Restock all items (convenience dev endpoint)
const restockAll = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany();
    
    const updated = await prisma.$transaction(
      items.map(item => 
        prisma.inventoryItem.update({
          where: { id: item.id },
          data: { stock: item.stock + 10 }
        })
      )
    );

    // Log action
    await prisma.auditLog.create({
      data: {
        user: req.user.email,
        role: req.user.role === 'admin' ? 'Clinic Admin' : 'Veterinarian',
        action: 'Restock All',
        details: 'Triggered bulk restock (+10 units) across all inventory lines.'
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error restocking all items:', error);
    return res.status(500).json({ message: 'Failed to bulk-restock inventory.' });
  }
};

module.exports = {
  getInventory,
  restockItem,
  restockAll
};
