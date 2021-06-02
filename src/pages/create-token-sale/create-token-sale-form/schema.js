import * as Yup from 'yup';

import { errorForm, SYSTEM } from '@/constants'
import regex from '@/utils/regex'

const SUPPORTED_FORMATS = SYSTEM.WHITE_LIST_ACCEPT_TYPE;
const isValid = (value) => {
    if (value) return true;
    return false;
}
export const ProjectSchema = Yup.object().shape({
    project_logo: Yup.string().required(errorForm.REQUIRED),
    project_name: Yup.string().required(errorForm.REQUIRED).trim().max(255, errorForm.CHAR_MAX_255).test('required', errorForm.REQUIRED, isValid).nullable(),
    project_website: Yup.string().required(errorForm.REQUIRED).url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
    project_email: Yup.string().email(errorForm.INVALID_EMAIL).required(errorForm.REQUIRED).matches(regex.email, errorForm.INVALID_EMAIL).trim().nullable(),
    project_additional_info: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    project_twitter: Yup.string().url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
    project_telegram: Yup.string().url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
    project_medium: Yup.string().url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
    project_discord: Yup.string().url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
    project_white_paper: Yup.string().url(errorForm.INVALID_URL).trim().nullable(false).typeError(errorForm.INVALID_URL),
});

export const TokenSchema = Yup.object().shape({
    token_contract_address: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    token_name: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    payment_currency: Yup.string().required(errorForm.REQUIRED),
    list_amm: Yup.string().required(errorForm.REQUIRED)
});

export const SalesSchema = Yup.object().shape({
    swap_ratio: Yup.string().matches(regex.decimal, errorForm.IS_NUMBER).required(errorForm.REQUIRED),
    soft_cap: Yup.string().matches(regex.decimal0, errorForm.GREATER_THAN_0).required(errorForm.REQUIRED),
    sale_start_time: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    sale_end_time: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    listing_time: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    sale_allocation: Yup.string().matches(regex.decimal, errorForm.IS_NUMBER).required(errorForm.REQUIRED),
    lock_liquidity: Yup.string().required(errorForm.REQUIRED),
    whitelist_address: Yup.mixed()
        .when('access_type', {
            is: (access_type) => access_type === 'private',
            then: Yup.mixed().required(errorForm.REQUIRED).test('fileType', errorForm.INVALID_CSV_FILE, value => SUPPORTED_FORMATS.includes(value?.type)).nullable()
        }),
    access_type: Yup.string().required(errorForm.REQUIRED).trim().nullable(),
    max_allocation_wallet: Yup.mixed()
        .when('max_allocation_wallet_limit', {
            is: (max_allocation_wallet_limit) => max_allocation_wallet_limit === true,
            then: Yup.string().matches(regex.decimal0, errorForm.GREATER_THAN_0).required(errorForm.REQUIRED).nullable()
        }),
    min_allocation_wallet: Yup.mixed()
        .when('min_allocation_wallet_limit', {
            is: (min_allocation_wallet_limit) => min_allocation_wallet_limit === true,
            then: Yup.string().matches(regex.decimal0, errorForm.GREATER_THAN_0).required(errorForm.REQUIRED).nullable()
        }),
    // token_contract_address: "0xfAa08724e0564FA59a517A1Db8c5856A99226445",
    // token_name: "token_A",
    // payment_currency: "ETH",
    // list_amm: "UNISWAP",
    // hard_cap: 50,
    // max_allocation_wallet_limit: false,
    // min_allocation_wallet_limit: false,
    // access_type: "public",
    // whitelist_address: Yup.mixed()
    //     .test('fileRequried', "Required", value => value)
    //     .test('fileSize', "File Size is too large", value => value?.size <= FILE_SIZE)
    //     .test('fileType', "Unsupported File Format", value => SUPPORTED_FORMATS.includes(value?.type) )
    // listing_rate: 2,
    // initial_liquidity_per: 10,
    // lock_liquidity: "ONE_MONTH",
    // est_funding: 1000
});