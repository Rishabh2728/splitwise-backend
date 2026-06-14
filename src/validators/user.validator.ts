export const validateUserCreate = (data: any) => {
  if (!data.email) throw new Error('email required');
}
