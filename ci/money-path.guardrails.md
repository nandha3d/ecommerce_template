CHECK THE FOLLOWING:

- Order.total == CheckoutSnapshot.total
- PaymentIntent.amount == Order.total
- Inventory deduction happens ONLY after payment success
- One snapshot -> one order
- One order -> max one successful payment

FAIL IF ANY CHECK FAILS.
