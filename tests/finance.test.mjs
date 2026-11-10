import test from 'node:test';
import assert from 'node:assert/strict';
import { computeQuoteFinancials, computeMonthlyInstallment, formatEuro } from '../src/finance.js';

test('guards financed capital against negative balances when sale price is zero or omitted', () => {
  const result = computeQuoteFinancials({
    salePrice: 0,
    discount: 500,
    warranty: 0,
    downPayment: 3000,
  });

  assert.equal(result.offerTotal, 0);
  assert.equal(result.financedCapital, 0);
  assert.equal(result.schedule.length, 6);
  assert.equal(result.schedule[0].monthlyPayment, 0);
});

test('computes offer total, financed capital, opening fee, and 60-120 month schedule', () => {
  const result = computeQuoteFinancials({
    salePrice: 24590,
    discount: 1000,
    warranty: 400,
    downPayment: 4000,
    annualTinPercent: 7.9,
    openingFeePercent: 2.0,
  });

  assert.equal(result.offerTotal, 23990);
  assert.equal(result.financedCapital, 19990);
  assert.equal(result.openingFeeAmount, 399.8);
  assert.equal(result.capitalWithFee, 20389.8);
  assert.equal(result.schedule[0].months, 60);
  assert.equal(result.schedule[5].months, 120);
  assert.ok(result.schedule[0].monthlyPayment > result.schedule[5].monthlyPayment);
});

test('handles zero TIN interest cleanly without NaN', () => {
  const monthly = computeMonthlyInstallment(12000, 0, 60);
  assert.equal(monthly, 200);
});

test('formats currency in European notation', () => {
  assert.equal(formatEuro(22590), '22.590,00 €');
  assert.equal(formatEuro(0), '0,00 €');
});
