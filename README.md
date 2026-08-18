# Factor Library IL

Open factor and risk-free return data for the Israeli equity market, published as CSV files. The
construction of each series is documented, and the site includes a regression tool.

Daily and monthly, covering 133 months from July 2015.

|          |           |                                        |
| -------- | --------- | -------------------------------------- |
| `rf`     | Risk-free | Short-term shekel return               |
| `mkt_rf` | Market    | Market return above the risk-free rate |
| `smb`    | Size      | Small companies minus large            |
| `hml`    | Value     | Value companies minus growth           |
| `mom`    | Momentum  | Recent winners minus losers            |

## Get the data

- `https://factorlib.org/data/factors_daily.csv`
- `https://factorlib.org/data/factors_monthly.csv`
- `https://factorlib.org/data/manifest.json` — versions, coverage, row counts
- `https://factorlib.org/data/stats.json` — summary statistics

```python
import pandas as pd

daily = pd.read_csv(
    "https://factorlib.org/data/factors_daily.csv",
    parse_dates=["date"],
)
```

Every file has a `date` column plus one column per factor, as decimal returns — `0.0125` means
1.25%. [docs/data-format.md](docs/data-format.md) has the full schema.

Each release is also attached to a [GitHub release](../../releases) tagged with its data version,
so a version you cite stays downloadable after the next refresh.

## The website

[factorlib.org](https://factorlib.org) reads these same files and adds charts, the methodology,
and a regression tool. It is in Hebrew at the root and in English below `/en/`.

The regression tool estimates a fund or portfolio's factor exposures and alpha. It runs in the
browser; the file is not uploaded, stored, or sent anywhere. Input is a CSV or single-sheet XLSX
with `date,nav` or `date,return`. MKT-RF is always included; the other factors are optional.

## Versions

Data versions use calendar versioning: `2026.07` for a regular release, `2026.07.2` for a
correction within the same month. The methodology version is separate, because data is refreshed
monthly without the construction changing.

## What is in this repository

```
public/data/    the published CSV and JSON files
docs/           data format, and the data licence
src/            the website
tests/          unit and browser tests
scripts/        maintainer tools
```

This repository publishes the dataset and hosts the site. Pull requests are not accepted; questions
and corrections are welcome as [issues](../../issues).

## Licence

The code is MIT. The data is CC BY-NC 4.0, which requires attribution and does not permit commercial use. Terms and the attribution
string are in [docs/DATA_LICENSE.md](docs/DATA_LICENSE.md).
