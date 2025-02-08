'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSchema, FormField } from '@/lib/form-builder/form-builder.types';

interface FormBuilderProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, string | number>) => void;
}

type FormData = Record<string, string | number>;

export function FormBuilder({ schema, onSubmit }: FormBuilderProps) {
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  
  // Generate Zod schema dynamically
  const generateZodSchema = (fields: FormField[]) => {
    const schemaObject: Record<string, z.ZodString | z.ZodNumber> = {};
    
    fields.forEach((field) => {
      let fieldSchema = field.type === 'number' ? z.number() : z.string();
      
      if (field.validation) {
        field.validation.forEach((rule) => {
          if (fieldSchema instanceof z.ZodString) {
            switch (rule.type) {
              case 'required':
                fieldSchema = fieldSchema.min(1, rule.message);
                break;
              case 'pattern':
                fieldSchema = fieldSchema.regex(new RegExp(rule.value), rule.message);
                break;
            }
          }
        });
      }
      
      schemaObject[field.id] = fieldSchema;
    });
    
    return z.object(schemaObject);
  };

  const zodSchema = generateZodSchema(schema.fields);
  
  const form = useForm<FormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const shouldShowField = (field: FormField): boolean => {
    if (!field.showIf) return true;

    return field.showIf.every((condition) => {
      const fieldValue = formValues[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        default:
          return true;
      }
    });
  };

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              onValueChange={(value) => {
                setFormValues((prev) => ({ ...prev, [field.id]: value }));
                form.setValue(field.id, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors[field.id as keyof FormData] && (
              <p className="text-sm text-red-500">
                {form.formState.errors[field.id as keyof FormData]?.message}
              </p>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              {...form.register(field.id)}
              onChange={(e) => {
                setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }));
                form.setValue(field.id, e.target.value);
              }}
            />
            {form.formState.errors[field.id as keyof FormData] && (
              <p className="text-sm text-red-500">
                {form.formState.errors[field.id as keyof FormData]?.message}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {schema.fields.map((field) => renderField(field))}
      </div>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}