export type FieldType =
  | 'text'
  | 'textarea'
  | 'translatable-text'
  | 'translatable-textarea'
  | 'translatable-list'
  | 'number'
  | 'checkbox'
  | 'image'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  colSpan?: 1 | 2
}

export interface ResourceConfig {
  /** API path segment, e.g. "team" -> /admin/team */
  apiPath: string
  /** i18n key for the nav/page title, e.g. "nav.team" */
  titleKey: string
  fields: FieldConfig[]
  /** Column(s) shown in the list table, evaluated against the raw admin JSON row. */
  listColumns: { key: string; label: string; translatable?: boolean; image?: boolean }[]
  hasOrder?: boolean
  hasSlug?: boolean
  slugSourceField?: string
  mediaField?: { formKey: string; collection: string } // single-image resources
}

export const RESOURCES: Record<string, ResourceConfig> = {
  'project-categories': {
    apiPath: 'project-categories',
    titleKey: 'nav.projectCategories',
    hasOrder: true,
    hasSlug: true,
    slugSourceField: 'name',
    fields: [{ key: 'name', label: 'common.category', type: 'translatable-text', required: true, colSpan: 2 }],
    listColumns: [{ key: 'name', label: 'common.category', translatable: true }],
  },
  'news-categories': {
    apiPath: 'news-categories',
    titleKey: 'nav.newsCategories',
    hasOrder: true,
    hasSlug: true,
    slugSourceField: 'name',
    fields: [{ key: 'name', label: 'common.category', type: 'translatable-text', required: true, colSpan: 2 }],
    listColumns: [{ key: 'name', label: 'common.category', translatable: true }],
  },
  services: {
    apiPath: 'services',
    titleKey: 'nav.services',
    hasOrder: true,
    fields: [
      { key: 'icon', label: 'Icon key', type: 'text', colSpan: 2 },
      { key: 'title', label: 'Title', type: 'translatable-text', required: true, colSpan: 2 },
      { key: 'description', label: 'Description', type: 'translatable-textarea', colSpan: 2 },
      { key: 'features', label: 'Features', type: 'translatable-list', colSpan: 2 },
    ],
    listColumns: [{ key: 'title', label: 'Title', translatable: true }],
  },
  team: {
    apiPath: 'team',
    titleKey: 'nav.team',
    hasOrder: true,
    mediaField: { formKey: 'photo', collection: 'photo' },
    fields: [
      { key: 'photo', label: 'common.image', type: 'image', colSpan: 2 },
      { key: 'name', label: 'Name', type: 'translatable-text', required: true },
      { key: 'position', label: 'Position', type: 'translatable-text', required: true },
    ],
    listColumns: [
      { key: 'photo', label: 'common.image', image: true },
      { key: 'name', label: 'Name', translatable: true },
      { key: 'position', label: 'Position', translatable: true },
    ],
  },
  milestones: {
    apiPath: 'milestones',
    titleKey: 'nav.milestones',
    hasOrder: true,
    fields: [
      { key: 'year', label: 'Year', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'translatable-text', required: true },
      { key: 'description', label: 'Description', type: 'translatable-textarea', colSpan: 2 },
    ],
    listColumns: [
      { key: 'year', label: 'Year' },
      { key: 'title', label: 'Title', translatable: true },
    ],
  },
  awards: {
    apiPath: 'awards',
    titleKey: 'nav.awards',
    hasOrder: true,
    mediaField: { formKey: 'icon_image', collection: 'icon' },
    fields: [
      { key: 'icon_image', label: 'common.image', type: 'image', colSpan: 2 },
      { key: 'year', label: 'Year', type: 'text', required: true },
      { key: 'icon', label: 'Icon key (fallback if no image)', type: 'text' },
      { key: 'title', label: 'Title', type: 'translatable-text', required: true, colSpan: 2 },
      { key: 'description', label: 'Description', type: 'translatable-textarea', colSpan: 2 },
    ],
    listColumns: [
      { key: 'icon_image', label: 'common.image', image: true },
      { key: 'year', label: 'Year' },
      { key: 'title', label: 'Title', translatable: true },
    ],
  },
  'core-values': {
    apiPath: 'core-values',
    titleKey: 'nav.coreValues',
    hasOrder: true,
    fields: [
      { key: 'icon', label: 'Icon key', type: 'text', colSpan: 2 },
      { key: 'title', label: 'Title', type: 'translatable-text', required: true },
      { key: 'description', label: 'Description', type: 'translatable-textarea', colSpan: 2 },
    ],
    listColumns: [{ key: 'title', label: 'Title', translatable: true }],
  },
  'sales-offices': {
    apiPath: 'sales-offices',
    titleKey: 'nav.salesOffices',
    hasOrder: true,
    fields: [
      { key: 'name', label: 'Name', type: 'translatable-text', required: true, colSpan: 2 },
      { key: 'address', label: 'Address', type: 'translatable-textarea', colSpan: 2 },
      { key: 'phone', label: 'Phone', type: 'text' },
    ],
    listColumns: [
      { key: 'name', label: 'Name', translatable: true },
      { key: 'phone', label: 'Phone' },
    ],
  },
}
