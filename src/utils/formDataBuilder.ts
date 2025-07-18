
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildFormData = (data: Record<string, any>, form = new FormData(), parentKey = '') => {
    Object.entries(data).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}[${key}]` : key;
  
      if (value instanceof File) {
        form.append(fullKey, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            form.append(`${fullKey}[${index}]`, item);
          } else if (typeof item === 'object') {
            buildFormData(item, form, `${fullKey}[${index}]`);
          } else {
            form.append(`${fullKey}[${index}]`, item);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        buildFormData(value, form, fullKey);
      } else if (value !== undefined && value !== null) {
        form.append(fullKey, value);
      }
    });
  
    return form;
  };
  