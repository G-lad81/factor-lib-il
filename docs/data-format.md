# Public data format

Factor Library IL publishes daily and monthly CSV files with the same strict schema. This
document describes the public release files.

## Files

- `factors_daily.csv`: one observation per published daily factor-calendar date.
- `factors_monthly.csv`: one observation per published monthly factor-calendar date.
- `manifest.json`: publication status, versions, active factors, coverage, and row counts.
- `stats.json`: monthly factor-performance statistics and their explanatory notes.

The manifest exposes an ordered `factors` list, a `data_version`, a `methodology_version`, and
`data_license: "CC-BY-NC-4.0"`. Data versions use calendar versioning: `YYYY.MM` for a regular monthly
release and `YYYY.MM.N` for a corrected release in the same month. Usage rules are set out in
[DATA_LICENSE.md](DATA_LICENSE.md).

The website displays `stats.json` only for a ready release. Its window, month count, and generation
time and data version must match the monthly dataset and manifest. Its factor entries must exactly match the
manifest factors other than `rf`. Factor means and volatility are monthly; Sharpe
ratios are annualized and labelled accordingly. RF is reported as context rather than as a factor
row.

## CSV schema

The header is exactly `date` followed by the manifest's ordered `factors` list. For the complete
production release:

```text
date,rf,mkt_rf,smb,hml,mom
```

| Column   | Public meaning                                     | Format           |
| -------- | -------------------------------------------------- | ---------------- |
| `date`   | Observation date for the published factor calendar | ISO `YYYY-MM-DD` |
| `rf`     | Risk-free simple return for the period             | Decimal return   |
| `mkt_rf` | Market return minus the risk-free return           | Decimal return   |
| `smb`    | Small-minus-Big size-factor return                 | Decimal return   |
| `hml`    | High-minus-Low value-factor return                 | Decimal return   |
| `mom`    | Winner-minus-Loser momentum-factor return          | Decimal return   |

Returns are finite decimal simple returns. For example, `0.0125` means `1.25%`; percentage signs
are never included. Rows are unique and strictly ascending by date. Published files contain no
blank rows or missing values.

Every ready release must begin with `rf,mkt_rf`. Optional known factors may follow in canonical
order. Unknown, duplicate, missing, extra, or reordered columns are rejected. The public deployment
gate additionally requires the complete factor set shown above.

The methodology page documents the economic construction of each series.

## Portfolio input schemas

The browser regression tool accepts exactly one of these two-column schemas:

```text
date,nav
date,return
```

Users explicitly select NAV or returns and daily or monthly. CSV dates must be exact
`YYYY-MM-DD` text. XLSX dates may be exact `YYYY-MM-DD` text or native Excel date cells; ambiguous
date text is rejected. The tool does not infer headers, frequency, or units and does not repair or
resample input.
