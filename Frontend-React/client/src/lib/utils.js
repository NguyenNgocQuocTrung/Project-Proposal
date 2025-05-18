/**
 * Merge multiple class strings together
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a date string
 */
export function formatDate(date) {
  if (!date) return '';
  
  try {
    // Đảm bảo date là một đối tượng Date hợp lệ
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Generate a random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalize the first letter of each word in a string
 */
export function capitalizeWords(string) {
  if (!string) return '';
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate the number of nights between two dates
 */
export function calculateNights(checkInDate, checkOutDate) {
  const startDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  const timeDiff = Math.abs(endDate - startDate);
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Check if an email address is valid
 */
export function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Get a human-readable room type label
 */
export function getRoomTypeLabel(type) {
  const types = {
    'single': 'Single Room',
    'double': 'Double Room',
    'suite': 'Suite',
  };
  return types[type] || type;
}

/**
 * Get a human-readable service category label
 */
export function getServiceCategoryLabel(category) {
  const categories = {
    'food': 'Food & Dining',
    'cleaning': 'Cleaning & Housekeeping',
    'spa': 'Spa & Wellness',
    'transport': 'Transportation',
    'entertainment': 'Entertainment',
    'other': 'Other Services',
  };
  return categories[category] || category;
}

/**
 * Get a color class based on status
 */
export function getStatusColorClass(status) {
  const statusColors = {
    'active': 'bg-green-500',
    'pending': 'bg-amber-500',
    'completed': 'bg-blue-500',
    'cancelled': 'bg-gray-500',
    'paid': 'bg-green-500',
    'unpaid': 'bg-red-500',
    'overdue': 'bg-red-500',
  };
  
  return statusColors[status] || 'bg-gray-500';
}

/**
 * Generate a printable invoice
 */
export function generatePrintableInvoice(invoice) {
  const content = `
    <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .invoice-details { margin-bottom: 30px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table th { background-color: #f2f2f2; text-align: left; padding: 10px; }
          .invoice-table td { border-bottom: 1px solid #ddd; padding: 10px; }
          .total-row td { font-weight: bold; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>Hotel Management System</div>
          </div>
          <div>
            <div>Invoice #: ${invoice.id}</div>
            <div>Date: ${formatDate(invoice.date)}</div>
            <div>Due Date: ${formatDate(invoice.dueDate)}</div>
          </div>
        </div>
        
        <div class="invoice-details">
          <div><strong>Bill To:</strong></div>
          <div>${invoice.guestName}</div>
          <div>Room: ${invoice.roomNumber}</div>
          <div>Check-in: ${formatDate(invoice.checkInDate)}</div>
          <div>Check-out: ${formatDate(invoice.checkOutDate)}</div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Room Charge (${invoice.roomType})</td>
              <td>${calculateNights(invoice.checkInDate, invoice.checkOutDate)} nights</td>
              <td>${formatCurrency(invoice.roomRate)}</td>
              <td>${formatCurrency(invoice.roomTotal)}</td>
            </tr>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">Total</td>
              <td>${formatCurrency(invoice.total)}</td>
            </tr>
          </tbody>
        </table>
        
        <div>
          <div><strong>Payment Terms:</strong> Due on receipt</div>
          <div><strong>Notes:</strong> ${invoice.notes || 'Thank you for your business!'}</div>
        </div>
      </body>
    </html>
  `;
  
  return content;
}