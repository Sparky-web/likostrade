/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const createArrayLinkedFieldsMapper = (fieldsToMap: string[]) => (data: any) => {
  return Object.entries(data).reduce(
    (acc: Record<string, any>, [key, value]) => {
      if (fieldsToMap.includes(key)) {
        acc[key] = (value as any[])?.map((item: any) => item.id);
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
};
