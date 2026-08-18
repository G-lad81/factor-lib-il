import { COPY } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

interface Props {
  locale?: Locale;
  file?: File;
  available: boolean;
  running: boolean;
  status: string;
  error: string;
  fileInput: { current: HTMLInputElement | null };
  onFileChange: (file?: File) => void;
  onRun: () => void;
}

export function FileUpload({
  file,
  available,
  running,
  status,
  error,
  fileInput,
  onFileChange,
  onRun,
  locale = 'he',
}: Props) {
  const copy = COPY[locale].regression;
  return (
    <section class="upload card" aria-labelledby="upload-title">
      <p class="eyebrow">{copy.step3}</p>
      <h2 id="upload-title">{copy.validate}</h2>
      <label class={`drop-zone ${file ? 'has-file' : ''}`}>
        <span class="upload-mark" aria-hidden="true">
          ↑
        </span>
        <strong>
          <bdi>{file ? file.name : copy.chooseFile}</bdi>
        </strong>
        <span>{file ? <bdi>{`${(file.size / 1024).toFixed(1)} KB`}</bdi> : copy.localFile}</span>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,.xlsx"
          onChange={(event) => onFileChange(event.currentTarget.files?.[0])}
        />
      </label>
      <button
        class="button run"
        type="button"
        disabled={!available || running || !file}
        onClick={onRun}
      >
        {running ? copy.validating : copy.run}
      </button>
      <p class="status-line" role="status">
        {status}
      </p>
      {error && (
        <div class="error" role="alert">
          <strong>{copy.rejected}</strong>
          <p dir="auto">{error}</p>
          <a href="#file-formats">{copy.reviewFormat}</a>
        </div>
      )}
    </section>
  );
}
