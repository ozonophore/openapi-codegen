export const REGEX_BACKSLASH = /\\/g;

export const REGEX_MULTIPLE_SLASHES = /\/+/g;

export const REGEX_DOT_SLASH = /\/(\.\/)+/g;

export const REGEX_LEADING_DOT_SLASH = /^(\.\/)+/g;

export const REGEX_TRAILING_SLASH = /\/$/g;

export const GROUP_PRIORITY_EXTENDED = {
    required: 0,
    'required-with-default': 1,
    optional: 2,
    'optional-with-default': 3,
} as const;

export const GROUP_PRIORITY_SIMPLE = {
  'requires-value': 0,
  'other': 1
} as const;