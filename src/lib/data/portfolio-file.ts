import readXlsxFile from 'read-excel-file/browser';
import { ContractError, parseCsvMatrix } from './contracts';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function normalizeNativeExcelDates(matrix: unknown[][]): unknown[][] {
  return matrix.map((row, rowIndex) => {
    if (rowIndex === 0 || !(row[0] instanceof Date)) return row;
    const date = row[0];
    if (
      !Number.isFinite(date.valueOf()) ||
      date.getUTCHours() !== 0 ||
      date.getUTCMinutes() !== 0 ||
      date.getUTCSeconds() !== 0 ||
      date.getUTCMilliseconds() !== 0
    ) {
      throw new ContractError(
        `Row ${rowIndex + 1}: the native Excel date must not include a time of day.`,
      );
    }
    const normalized = [...row];
    normalized[0] = date.toISOString().slice(0, 10);
    return normalized;
  });
}

export async function fileMatrix(file: File): Promise<unknown[][]> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ContractError('File size must not exceed 5 MB.');
  }
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') return parseCsvMatrix(await file.text());
  if (extension === 'xlsx') {
    const sheets = await readXlsxFile(file, { trim: false });
    if (sheets.length !== 1) {
      throw new ContractError('XLSX files must contain exactly one worksheet.');
    }
    return normalizeNativeExcelDates(sheets[0]!.data);
  }
  throw new ContractError('File type must be .csv or .xlsx.');
}
