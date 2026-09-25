# TransactionFlow Recovery UX - QA Verification Guide

## Summary
This PR implements recovery UX when `/api/transactions` fails by mapping failure modes to actionable product copy. Users can now retry, edit amount, or contact support when network and server errors occur. All pending states clean up properly on component unmount.

## Changes Made

### 1. Error Mode Types and Product Copy Mapping
- **File**: [src/lib/transactions.ts](src/lib/transactions.ts)
- **Changes**: 
  - Added `RecoveryAction` type: "retry" | "edit" | "support"
  - Added `ErrorMode` type covering network, timeout, validation, quota, state conflicts, and server errors
  - Added `TransactionRecoveryUI` interface with actionable product copy and recovery actions
  - Created `ERROR_RECOVERY_COPY` mapping for each error mode with:
    - Clear title describing the issue
    - Descriptive message with actionable next steps
    - Primary action (retry/edit)
    - Optional secondary and tertiary actions
    - Support email reference
  - Implemented `mapErrorCodeToErrorMode()` function to convert API error codes to error modes
  - Implemented `getTransactionRecoveryUI()` function to get recovery product copy by error code or mode

### 2. Error Recovery UI Component
- **File**: [src/components/transactions/TransactionErrorRecovery.tsx](src/components/transactions/TransactionErrorRecovery.tsx)
- **Purpose**: Displays error recovery UI with three clear action paths
- **Features**:
  - Shows error title and descriptive copy
  - Displays transaction reference (if available) for support follow-up
  - Provides primary and secondary action buttons
  - Optional tertiary "Contact Support" button that opens email client
  - Accepts `onActionSelect` callback for handling user recovery action selection
  - Proper cleanup on unmount through component lifecycle

### 3. TransactionFlow Component Updates
- **File**: [src/components/transactions/TransactionFlow.tsx](src/components/transactions/TransactionFlow.tsx)
- **Changes**:
  - Added "error" stage to transaction stages
  - Added `recovery` state to track recovery UI for current error
  - Added `lastErrorReference` state to store transaction reference for support
  - Updated `handleReview()` error handling to:
    - Map API error codes to recovery UI
    - Set stage to "error" instead of showing generic message
    - Preserve transaction reference in error recovery UI
  - Updated `handleConfirm()` error handling to:
    - Map API error codes to recovery UI with transaction reference
    - Set stage to "error" for recovery UI display
  - Added `handleRecoveryAction()` function to handle user recovery action selection:
    - "retry": Clears error state and returns to form
    - "edit": Returns to form for users to modify amount/wallet
    - "support": Opens email client with pre-filled subject and transaction reference
  - Updated cleanup effect to ensure all state is cleared on unmount
  - Updated `currentStepIndex()` to treat "error" stage as step 0 (form step)

### 4. Comprehensive Test Suite
- **File**: [src/lib/transactions.test.ts](src/lib/transactions.test.ts)
- **Test Coverage**:
  - Error code to error mode mapping for all failure types
  - Recovery UI generation for each error mode
  - Actionable copy validation (includes context-specific guidance)
  - Primary/secondary/tertiary action validation
  - Transaction reference inclusion in recovery UI
  - Support email presence in all error modes
  - Falls back to "unknown_error" for unmapped error codes

## Acceptance Criteria Met

### ✅ Clear owner and scope agreed
- **Owner**: TransactionFlow component error handling
- **Scope**: Network/server error recovery with actionable product copy
- **In scope**: Error mapping, recovery UI, three action paths (retry/edit/support)
- **Not in scope**: Backend error handling, network infrastructure

### ✅ Change is verifiable
**Tests**: [src/lib/transactions.test.ts](src/lib/transactions.test.ts)
- 20+ unit tests covering all error modes, mappings, and recovery UI generation
- Tests verify actionable copy specific to each error mode
- Tests validate all primary/secondary/tertiary actions are one of: retry, edit, support
- Tests ensure transaction reference is preserved for support follow-up
- Run with: `npm test -- src/lib/transactions.test.ts`

**QA Steps** (See section below)

### ✅ No new duplicate abstractions
All new abstractions have clear purpose:
- `RecoveryAction` type: Maps three distinct user recovery paths
- `ErrorMode` type: Normalized error categorization for reusable product copy
- `TransactionRecoveryUI` interface: Ensures consistent recovery UX structure
- `ERROR_RECOVERY_COPY` constant: Single source of truth for recovery messages

---

## QA Verification Steps

### Test Case 1: Network Error Recovery
**Objective**: Verify network errors display actionable recovery UI

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter a valid amount (e.g., 100 USDC)
3. Click "Review [deposit/withdrawal]"
4. **Simulate**: Disable network connection or use browser DevTools to mock network failure
5. **Verify**:
   - Error stage displays with title: "Connection lost"
   - Description mentions: "connection," "check your network," "contact support"
   - Three action buttons appear:
     - Primary: "Retry request" (retries the quote request)
     - Secondary: "Edit details" (returns to form)
     - Tertiary: "Contact support" (opens email client)

**Expected Behavior**:
- Clicking "Retry request" re-attempts the quote request
- Clicking "Edit details" returns to the form with previous values intact
- Clicking "Contact support" opens email with subject containing transaction reference (if available)

---

### Test Case 2: Timeout Error Recovery
**Objective**: Verify timeout errors map to "try again" recovery actions

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter a valid amount
3. Open DevTools Network tab
4. Add a request throttle (e.g., 30 second delay)
5. Click "Review"
6. Wait for timeout (12 seconds default)
7. **Verify**:
   - Error title: "Request timed out"
   - Description mentions: "took too long," "settings are still saved," "adjust amount"
   - Primary action: "Retry" (not "Retry request")
   - Secondary action: "Edit amount"

**Expected Behavior**:
- Amount and wallet settings are preserved in form on "Edit amount" action
- Retry capability allows user to re-submit without re-entering data

---

### Test Case 3: Validation Error Recovery
**Objective**: Verify validation errors guide users to fix input

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter an invalid wallet address (e.g., for withdrawal)
3. Click "Review withdrawal"
4. **Simulate**: Mock API response with validation error:
   ```json
   {
     "success": false,
     "error": {
       "code": "INVALID_WALLET",
       "message": "Invalid wallet format",
       "details": { "walletAddress": ["Invalid format"] }
     }
   }
   ```
5. **Verify**:
   - Error title: "Validation failed"
   - Description includes: "didn't pass validation," "review your entries"
   - Primary action: "Edit details" (not "Retry")
   - Error recovery guides user back to form

---

### Test Case 4: Quota/Insufficient Balance Error
**Objective**: Verify quota errors guide amount adjustment

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter an amount exceeding available balance (e.g., 20000 USDC)
3. Click "Review"
4. **Simulate**: Mock API response with quota error:
   ```json
   {
     "success": false,
     "error": {
       "code": "INSUFFICIENT_BALANCE",
       "message": "Insufficient balance",
       "details": { "amount": ["Amount exceeds available balance"] }
     }
   }
   ```
5. **Verify**:
   - Error title: "Amount exceeds limit"
   - Description includes: "available balance," "adjust amount," "try again"
   - Primary action: "Edit amount" (specific guidance to adjust)

---

### Test Case 5: State Conflict Error (Account Changed)
**Objective**: Verify state conflict errors ask user to review current state

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter valid details and start quotes review
3. **Simulate**: Account balance changes during session (mock `STATE_CONFLICT` error)
4. **Verify**:
   - Error title: "Account state changed"
   - Description includes: "balance," "wallet," "transaction status," "review"
   - Primary action: "Review and retry" (review current state first)
   - Secondary action: "Contact support"

---

### Test Case 6: Service Unavailable Error
**Objective**: Verify server errors offer retry and support paths

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter valid details
3. **Simulate**: Mock `SERVICE_UNAVAILABLE` error (500 response)
4. **Verify**:
   - Error title: "Service experiencing issues"
   - Description includes: "temporarily unavailable," "temporarily," "try again in a few moments"
   - Actions include both "Try again later" and "Contact support"

---

### Test Case 7: Unmount State Cleanup
**Objective**: Verify pending states clean up when component unmounts

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Start entering transaction details
3. **Simulate**: Pending state (mock API response with pending transaction)
4. Set pending state with a long `completionDelayMs` (e.g., 60000ms)
5. **Before completion**: Navigate away or close tab
6. **Verify**:
   - No memory leaks in DevTools
   - No lingering timers in browser
   - Component properly clears:
     - `timeoutRef` timer
     - Pending transaction state
     - Recovery state
     - Error state

**Implementation**: Open DevTools > Memory tab:
1. Take heap snapshot before navigation away
2. Navigate away from transactions page
3. Force garbage collection (trash icon)
4. Verify heap size decreased and no pending transaction references remain

---

### Test Case 8: Transaction Reference in Support Email
**Objective**: Verify transaction reference is included in support contact

**Steps**:
1. Navigate to `/dashboard/transactions`
2. Enter an amount and start review
3. **Simulate**: Error with quote reference included (e.g., `NW-DEP-20260426124530-ABC123`)
4. Error recovery UI displays (from Test 1)
5. Click "Contact support"
6. **Verify**:
   - Email client opens with:
     - To: `support@neurowealth.com`
     - Subject: `Transaction issue - Reference: NW-DEP-20260426124530-ABC123`
     - Body includes: Transaction reference, transaction type (deposit/withdrawal)

---

### Test Case 9: Error to Form Recovery Flow
**Objective**: Verify full recovery flow from error back to successful transaction

**Steps**:
1. Follow Test Case 2 (Timeout)
2. Verify error displays
3. Click "Retry request"
4. **Simulate**: Retry succeeds with quote response
5. **Verify**:
   - Error stage clears
   - Quote confirmation stage displays
   - All recovery state is cleaned up
   - User can complete transaction normally

---

### Test Case 10: All Error Mode Titles and Descriptions
**Objective**: Verify product copy consistency across all error modes

**Checklist**: From recovery UI constants, verify each error mode displays:
- ✅ **network_error**: "Connection lost" - mentions "network," "check"
- ✅ **timeout**: "Request timed out" - mentions "took too long," "settings saved," "adjust"
- ✅ **server_error**: "Service experiencing issues" - mentions "temporarily unavailable," "try again"
- ✅ **validation_error**: "Validation failed" - mentions "didn't pass," "make corrections"
- ✅ **quota_error**: "Amount exceeds limit" - mentions "available," "adjust"
- ✅ **state_conflict**: "Account state changed" - mentions "balance," "wallet," "review"
- ✅ **unknown_error**: "Something went wrong" - mentions "unexpected," "details saved"

Run with: Check each error code mapping in `mapErrorCodeToErrorMode()` and verify copy matches.

---

## Browser Compatibility Testing

**Devices**:
- Desktop (Chrome, Firefox, Safari)
- Mobile (iOS Safari, Chrome Mobile)
- Tablet (iPad)

**Verify on each device**:
1. Error recovery UI displays fully (no layout overflow)
2. Action buttons are tap-friendly on mobile (44px minimum)
3. Email opening works on mobile (mailto: links)
4. Transaction reference is visible and copyable

---

## Performance Validation

**Verify**:
1. No performance regression in component render time
2. Error mapping functions complete in <1ms
3. Cleanup on unmount is synchronous (no dangling timers)
4. Memory usage returns to baseline after error recovery

---

## Regression Testing

**Verify existing functionality still works**:
1. ✅ Successful deposit flow (form → confirm → pending → success)
2. ✅ Successful withdrawal flow
3. ✅ Field validation on form
4. ✅ Quote preview states (validation, confirm, pending, success, failure)
5. ✅ Theme switching (light/dark)
6. ✅ Transaction kind switching (deposit/withdrawal)

---

## Acceptance Sign-Off

- [ ] All 10 test cases pass
- [ ] Product copy is clear and actionable for each error mode
- [ ] Unmount cleanup verified (no memory leaks)
- [ ] No duplicate abstractions (error modes have clear purpose)
- [ ] Backward compatibility confirmed (existing flows unaffected)
- [ ] Browser compatibility verified across devices
- [ ] Performance impact acceptable for all error scenarios

---

## Implementation Notes

### Error Mapping Logic
The error mapping converts API error codes to `ErrorMode` for consistent product copy:
- Network-level errors → "network_error"
- Timeout errors → "timeout"
- Client validation errors → "validation_error"
- Rate limiting / quota → "quota_error"
- Concurrent updates / conflicts → "state_conflict"
- Server errors (5xx) → "server_error"
- Unmapped codes → "unknown_error"

### Recovery Actions
Each error mode offers up to three recovery paths:
1. **Retry**: Re-submit the same request (e.g., timeout, network errors)
2. **Edit**: Return to form to modify details (e.g., validation, amount errors)
3. **Support**: Open email client with transaction reference

### State Cleanup
On component unmount, the cleanup effect ensures:
1. Any pending timeout is cleared
2. All transaction state is reset
3. Error and recovery states are cleared
4. No memory leaks occur even if pending transactions are in-flight

---

## References

- **Component**: [src/components/transactions/TransactionFlow.tsx](src/components/transactions/TransactionFlow.tsx)
- **Library**: [src/lib/transactions.ts](src/lib/transactions.ts)
- **Recovery UI**: [src/components/transactions/TransactionErrorRecovery.tsx](src/components/transactions/TransactionErrorRecovery.tsx)
- **Tests**: [src/lib/transactions.test.ts](src/lib/transactions.test.ts)
- **API Error Types**: [src/lib/api-client.ts](src/lib/api-client.ts)
- **Issue**: #013 - TransactionFlow: recovery UX when /api/transactions fails
