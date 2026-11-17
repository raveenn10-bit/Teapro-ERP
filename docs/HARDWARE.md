# Hardware Configuration Guide

Install the manufacturer-supported Windows driver first, then select the device in TeaPro settings.

| Output | Initial printable width | Required checks |
|---|---:|---|
| 58 mm receipt | 48 mm | margin, logo density, Sinhala glyphs, cut position |
| 80 mm receipt | 72 mm | margin, details, signatures, QR/barcode |
| A4 invoice | 210 × 297 mm | scaling 100%, footer, signatures, no clipping |

Run test print and calibration before live use. Rasterized output may be required when a thermal driver cannot render Sinhala Unicode. A print failure must not duplicate the saved bill; reprint from invoice history.

## Weighing scales

Only USB/Serial models with a documented protocol can be integrated safely. Configure COM port, baud rate, data bits, parity, stop bits, line ending, stability marker and weight unit from the device manual. Confirm with certified test weights. Manual entry remains the fallback.

TeaPro ERP does **not** claim universal hardware compatibility. Every model, firmware, protocol, driver and cable combination requires real Windows testing.

Keyboard-wedge barcode scanners normally work as text input; serial scanners need a model-specific adapter. Keep an acceptance record with model, firmware, driver version, settings, results and date.
