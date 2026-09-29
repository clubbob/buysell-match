export const EXTRA_IMAGE_COUNT = 4;
export const IMAGE_SLOT_COUNT = 1 + EXTRA_IMAGE_COUNT;

export const SPEC_GRID = 'grid grid-cols-1 gap-x-2 sm:grid-cols-[max-content_minmax(0,1fr)]';
export const SPEC_ROW =
  'grid grid-cols-1 items-start gap-y-1.5 text-sm sm:col-span-2 sm:grid-cols-subgrid sm:items-center sm:gap-y-2';
export const SPEC_GROUP_TITLE = 'text-subtle sm:col-span-2 sm:whitespace-nowrap';
export const SPEC_PRICE_FIELDS =
  'grid min-w-0 grid-cols-1 items-center gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]';
export const SPEC_QTY_FIELDS =
  'grid min-w-0 grid-cols-1 items-center gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]';
export const SPEC_PANEL_PAD = 'min-w-0 px-4 pb-0 pt-5 sm:px-6 sm:pt-6';
