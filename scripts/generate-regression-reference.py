"""Generate committed regression fixtures with independent statsmodels calculations.

This script is a maintainer tool, not part of the website build. Run it in an environment with
NumPy and statsmodels, then review and commit the resulting JSON fixture.
"""

from __future__ import annotations

import json
import math
import os
import subprocess
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import statsmodels.api as sm


def observations(count: int = 40) -> list[dict[str, float | str]]:
    rows = []
    start = date(2025, 1, 1)
    for index in range(count):
        market = 0.004 * math.sin(index * 0.7) + 0.001 * ((index % 3) - 1)
        smb = 0.003 * math.cos(index * 0.31) + 0.0005 * (index % 5)
        hml = 0.002 * math.sin(index * 0.17 + 1) + 0.0003 * (index % 7)
        mom = 0.005 * math.cos(index * 0.23 - 0.4) + (0.0002 * index) / count
        rf = 0.0001
        noise = (((index * 17) % 11) - 5) * 0.00013
        excess = 0.0004 + 0.72 * market + 0.15 * smb - 0.08 * hml + 0.39 * mom + noise
        rows.append(
            {
                "date": (start + timedelta(days=index)).isoformat(),
                "rf": rf,
                "mkt_rf": market,
                "smb": smb,
                "hml": hml,
                "mom": mom,
                "portfolioReturn": excess + rf,
            }
        )
    return rows


def model(rows: list[dict[str, float | str]], factors: list[str], frequency: str) -> dict:
    x = sm.add_constant(np.array([[row[factor] for factor in factors] for row in rows]))
    y = np.array([row["portfolioReturn"] - row["rf"] for row in rows], dtype=float)
    lags = min(math.floor(4 * (len(rows) / 100) ** (2 / 9)), len(rows) - len(factors) - 2)
    result = sm.OLS(y, x).fit(cov_type="HAC", cov_kwds={"maxlags": lags, "use_correction": True})
    return {
        "frequency": frequency,
        "factors": factors,
        "coefficients": result.params.tolist(),
        "standardErrors": result.bse.tolist(),
        "tStats": result.tvalues.tolist(),
        "pValues": result.pvalues.tolist(),
        "rSquared": result.rsquared,
        "adjustedRSquared": result.rsquared_adj,
        "annualizedAlpha": result.params[0] * (252 if frequency == "daily" else 12),
        "hacLags": lags,
    }


rows = observations()
fixture = {
    "generator": "statsmodels 0.14.6",
    "observations": rows,
    "models": [
        model(rows, ["mkt_rf", "smb", "hml", "mom"], "daily"),
        model(rows, ["mkt_rf"], "daily"),
        model(rows, ["mkt_rf", "smb", "mom"], "monthly"),
    ],
}
target = Path(__file__).parents[1] / "tests" / "fixtures" / "statsmodels-regression.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(fixture, indent=2) + "\n", encoding="utf-8")
subprocess.run(
    ["npm.cmd" if os.name == "nt" else "npm", "exec", "prettier", "--", str(target), "--write"],
    check=True,
)
print(target)
