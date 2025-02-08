export type FieldCondition = {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains';
  value: string | number;
};

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  conditions?: FieldCondition[];
};

export type FormField = {
  id: string;
  type: 'text' | 'select' | 'number';
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: ValidationRule[];
  showIf?: FieldCondition[];
};

export type FormSchema = {
  id: string;
  title: string;
  fields: FormField[];
}; 