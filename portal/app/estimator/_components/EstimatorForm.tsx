"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EMPTY_FORM, HOUSING_FIELDS, parseFeatures, type FormValues } from "@/lib/fields";
import { validateForm } from "@/lib/validation";
import type { HousingFeatures } from "@/lib/types";

export function EstimatorForm({
  onSubmit,
  loading,
}: {
  onSubmit: (features: HousingFeatures, label: string) => void;
  loading: boolean;
}) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [label, setLabel] = useState("");
  const [errors, setErrors] = useState<Partial<FormValues>>({});

  const handleChange = (name: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(values);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    onSubmit(parseFeatures(values), label.trim());
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOUSING_FIELDS.map((f) => (
          <Input
            key={f.name}
            label={f.label}
            type="number"
            inputMode="decimal"
            step={f.step}
            min={f.min}
            max={f.max}
            placeholder={f.placeholder}
            value={values[f.name]}
            onChange={(e) => handleChange(f.name, e.target.value)}
            error={errors[f.name]}
          />
        ))}
      </div>

      <div className="mt-4">
        <Input
          label="Label (optional)"
          value={label}
          maxLength={120}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. My house"
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading && <Spinner />}
          {loading ? "Estimating…" : "Estimate price"}
        </Button>
      </div>
    </form>
  );
}
