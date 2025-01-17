import { custom, pipe, string, transform } from 'valibot';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const validPhoneNumber = () =>
  pipe(
    string(),
    custom((s) => {
      try {
        return phoneNumberUtil.isValidNumber(
          phoneNumberUtil.parse(s as string, 'us'),
        );
      } catch {
        return false;
      }
    }, 'Invalid phone number'),
    transform((s) =>
      phoneNumberUtil.format(
        phoneNumberUtil.parse(s as string, 'us'),
        PhoneNumberFormat.E164,
      ),
    ),
  );
