/**
 * Custom handlers for TravelService.
 *
 * - Proxies agent actions (chatWithAgent, approveBooking) to the Python
 *   LangGraph service running on port 8000.
 * - Validates Bookings on create.
 */
const cds = require('@sap/cds');

// URL of the Python agent service. Override via env var for deployment.
const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000';

module.exports = cds.service.impl(async function () {

  // ============================================================
  // Action: chatWithAgent
  // Proxies to Python's POST /chat
  // ============================================================
  this.on('chatWithAgent', async (req) => {
    const { threadId, message } = req.data;

    // Basic validation
    if (!message || message.trim() === '') {
      return req.error(400, 'message is required');
    }

    try {
      const response = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId || null,
          message: message,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return req.error(502, `Agent service error: ${response.status} ${text}`);
      }

      const data = await response.json();

      // Map Python's snake_case response to CDS camelCase return shape
      return {
        threadId: data.thread_id,
        reply: data.reply,
        needsApproval: data.interrupted,
        // CDS can't return arbitrary JSON, so stringify the payload.
        // The Fiori UI will JSON.parse() it.
        approvalData: data.interrupt_data ? JSON.stringify(data.interrupt_data) : '',
      };
    } catch (err) {
      console.error('chatWithAgent error:', err);
      return req.error(502, `Failed to reach agent: ${err.message}`);
    }
  });

  // ============================================================
  // Action: approveBooking
  // Proxies to Python's POST /resume
  // ============================================================
  this.on('approveBooking', async (req) => {
    const { threadId, decision } = req.data;

    // Validation
    if (!threadId) {
      return req.error(400, 'threadId is required');
    }
    if (!['approve', 'reject'].includes(decision)) {
      return req.error(400, "decision must be 'approve' or 'reject'");
    }

    try {
      const response = await fetch(`${AGENT_URL}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          decision: decision,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return req.error(502, `Agent service error: ${response.status} ${text}`);
      }

      const data = await response.json();

      return {
        reply: data.reply,
        status: data.interrupted ? 'still_pending' : 'completed',
      };
    } catch (err) {
      console.error('approveBooking error:', err);
      return req.error(502, `Failed to reach agent: ${err.message}`);
    }
  });

  // ============================================================
  // Validation: Bookings checkOut must be after checkIn
  // Runs BEFORE CAP's auto-generated CREATE handler
  // ============================================================
  this.before('CREATE', 'Bookings', async (req) => {
    const { checkIn, checkOut } = req.data;
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      req.error(400, 'checkOut must be after checkIn');
    }
  });

});