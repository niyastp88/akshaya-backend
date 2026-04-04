export const calculateReportData = async ({
  transactions,
  expenses,
  balances,
  balanceDoc,
}) => {
  let cash = balanceDoc?.openingCash || 0;
  let sbiCurrent = balanceDoc?.openingSbiCurrentBank || 0;
  let sbiSavings = balanceDoc?.openingSbiSavingsBank || 0;
  let edistrict = balanceDoc?.openingEdistrict || 0;
  let psa = balanceDoc?.openingPSA || 0;

  const all = [
    ...transactions.map((t) => ({ ...t.toObject(), category: "tx" })),
    ...expenses.map((e) => ({ ...e.toObject(), category: "expense" })),
    ...balances.map((b) => ({ ...b.toObject(), category: "balance" })),
  ];

  all.sort((a, b) => new Date(a.date) - new Date(b.date));

  const result = [];

  all.forEach((item) => {
    const date = item.date.toISOString().split("T")[0];

    if (item.category === "tx") {
      const inAmount =
        (item.cashAmount || 0) + (item.bankAmount || 0);

      cash += inAmount;
      sbiCurrent -= item.bankAmount || 0;
      edistrict -= item.edistrictAmount || 0;
      psa -= item.psaAmount || 0;

      result.push({
        date,
        serviceName: item.serviceName,
        in: inAmount,
        out: 0,
        cashBalance: cash,
        sbiCurrent,
        sbiSavings,
        edistrict,
        psa,
      });
    }

    else if (item.category === "expense") {
      cash -= item.amount;

      result.push({
        date,
        serviceName: item.expenseName,
        in: 0,
        out: item.amount,
        cashBalance: cash,
        sbiCurrent,
        sbiSavings,
        edistrict,
        psa,
      });
    }

    else if (item.category === "balance") {
      const type = item.type;

      if (type === "SBI Current Account") {
        cash -= item.amount;
        sbiCurrent += item.amount;
      }

      if (type === "SBI Savings Account") {
        cash -= item.amount;
        sbiSavings += item.amount;
      }

      if (type === "Edistrict") {
        sbiCurrent -= item.amount;
        edistrict += item.amount;
      }

      if (type === "PSA") {
        sbiCurrent -= item.amount;
        psa += item.amount;
      }

      result.push({
        date,
        serviceName: item.type,
        in: 0,
        out: 0,
        cashBalance: cash,
        sbiCurrent,
        sbiSavings,
        edistrict,
        psa,
      });
    }
  });

  return result;
};