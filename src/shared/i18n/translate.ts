import i18n from 'i18next';
import type {TOptions} from 'i18next';

import {TxKeyPath} from '.';

/**
 * Translates text.
 * @param {TxKeyPath} key - The i18n key.
 * @param {TOptions} options - The i18n options.
 * @returns {string} - The translated text.
 * @example
 * Translations:
 *
 * ```en.ts
 * {
 *  "hello": "Hello, {{name}}!"
 * }
 * ```
 *
 * Usage:
 * ```ts
 * import { translate } from "./i18n"
 *
 * translate("hello", { name: "world" })
 * // => "Hello world!"
 * ```
 */
export function translate(key: TxKeyPath, options?: TOptions): string {
  // Convert dấu hai chấm thành dấu chấm cho nested keys
  // vì i18next sử dụng dấu chấm để phân tách nested keys
  // Ví dụ: "permission:deniedTitle" -> "permission.deniedTitle"
  const normalizedKey = key.replace(/:/g, '.');
  
  // Kiểm tra xem i18n đã được khởi tạo chưa
  if (!i18n.isInitialized) {
    console.warn(`i18n chưa được khởi tạo khi translate key: ${key}`);
    return normalizedKey;
  }
  
  // Gọi i18n.t() với key đã được normalize
  const translated = i18n.t(normalizedKey, { ...options, ns: 'translation' });
  
  // Nếu kết quả trả về giống key (có nghĩa là không tìm thấy translation), trả về key gốc
  // Ngược lại trả về giá trị dịch
  return translated === normalizedKey ? normalizedKey : translated;
}
