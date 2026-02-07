export enum CheckoutLayoutVariant {
    DEFAULT = 1,
    REVERSE_COLUMNS = 2,
    SINGLE_COLUMN_SUMMARY_LAST = 3,
    SINGLE_COLUMN_NO_SUMMARY = 4,
    EARLY_COLUMNS = 5
}

export const getLayoutConfig = (variant: number) => ({
    reverseColumns: variant === CheckoutLayoutVariant.REVERSE_COLUMNS,
    singleColumn: [
        CheckoutLayoutVariant.SINGLE_COLUMN_SUMMARY_LAST,
        CheckoutLayoutVariant.SINGLE_COLUMN_NO_SUMMARY
    ].includes(variant),
    summaryFirst: variant === CheckoutLayoutVariant.SINGLE_COLUMN_SUMMARY_LAST,
    earlyColumns: variant === CheckoutLayoutVariant.EARLY_COLUMNS
});
