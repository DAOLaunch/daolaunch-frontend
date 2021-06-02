const errorForm = {
  REQUIRED: 'This field is a required field',
  IS_NUMBER: 'This field must be a `number` type',
  IS_NUMBER_MIN: "This field must be greater than or equal to min",
  IS_NUMBER_MAX: "This field must be less than or equal to max",
  INTEGER: 'This field must be an integer',
  NUMBER_MIN_0: 'This field must be greater than or equal to 0',
  NUMBER_MAX_18: 'This field must be less than or equal to 18',
  NUMBER_MAX_999999999999: 'This field must be less than or equal to 999,999,999,999',
  CHAR_MIN_1: 'This field must be at least 1 characters',
  CHAR_MAX_16: 'This field must be at most 16 characters',
  CHAR_MAX_64: 'This field must be at most 64 characters',
  CHAR_MAX_255: 'This field must be at most 255 characters',
  INVALID_EMAIL: 'Invalid email',
  INVALID_IMAGE: 'Please select images below 10MB in format',
  INVALID_FILE_TYPE: 'Upload file must jpg, gif or jpeg',
  INVALID_URL: 'URL is invalid',
  NUMBER_MAX_TOKEN_SUPPLY: 'Token supply is not enough',
  INVALID_CSV_FILE: 'You can only upload csv file',
  SYSTEM_ERROR: "System error",
  INVALID_TIME_NOW: 'This field must be greater than now time',
  INVALID_START_TIME: 'Start time must be less than end time',
  INVALID_SALE_TIME: 'End time must be greater than start time',
  INVALID_END_TIME: 'End time must be less than listing date',
  INVALID_LISTING_TIME: 'Listing date must be greater than end time',
  SOFT_CAP_ERROR: 'Soft cap must be less than hard cap',
  DECIMAL_INVALID: 'Decimal is invalid',
  MAX_ALLOCATION_INVALID: 'Max allocation must be less than hard cap',
  MIN_ALLOCATION_INVALID: 'Min allocation must be less than max allocation',
  GREATER_THAN_0: 'This field must be greater than 0',
  START_TIME_AFTER: 'Start time must be after current time',
  CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING: 'Token is live or upcoming or has been sold successfully',
  NOT_ENOUGH: 'Not enough',
  AMOUNT_LESS_THAN_HARD_CAP: 'Amount must be less than hard cap',
  TOKEN_HAS_BEEN_SOLD_OUT: 'All tokens has been sold out',
  NOT_ENOUGH_BALANCE: 'Not enough balance in wallet',
  INVALID_WHITELIST: 'Invalid whitelist',
  TIME_HAS_PASSED: 'Time has passed',
  CAN_NOT_GET_DEPOSIT: 'Can not get deposit',
  CAN_NOT_GET_GAS_PRICE: 'Can not get gas price',
}

export {
  errorForm
}

export default {
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed!',
  LISTING_TIME_MUST_BE_BIGGER_THAN_SALE_END_TIME: 'Listing date must be bigger than sale end time',
  INVALID_TOKEN: 'Token is not valid',
  CLAIM_FAILED: 'Claim failed, please try again',
  REFUND_FAILED: 'Refund failed, please try again'
}
