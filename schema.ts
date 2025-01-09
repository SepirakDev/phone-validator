import * as v from 'valibot';
export const validatePhoneSchema = v.object({
  phoneNumber: v.string()
})
