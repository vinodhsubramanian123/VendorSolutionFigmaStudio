import React from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { tokens } from "../../styles/tokens";
import { Database, X } from 'lucide-react';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CatalogSKU } from "../../types";
import { CatalogItemTypeSchema } from "../../types/schemas/schemaCatalog";
import { motion, AnimatePresence } from "motion/react";

interface CatalogAddFormProps {
  onAddSku: (data: Omit<CatalogSKU, "id" | "status">) => void;
  onClose: () => void;
}

const formSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  type: CatalogItemTypeSchema,
  partNumber: z.string().min(1, "Part Number is required"),
  name: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  leadTimeDays: z.number().min(0, "Lead time must be positive")
});

type FormValues = z.infer<typeof formSchema>;

export function CatalogAddForm({
  onAddSku,
  onClose
}: CatalogAddFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: "HPE",
      type: "Processor",
      partNumber: "",
      name: "",
      price: 0,
      leadTimeDays: 7
    }
  });

  const onSubmit = (data: FormValues) => {
    onAddSku(data);
  };

  useEscapeKey(onClose);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-surface-canvas/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn select-none leading-normal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-add-form-title"
    >
      <div
        className="w-full max-w-sm rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: tokens.colors.background.header, 
          borderColor: "rgba(74, 133, 253,0.18)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center justify-between pb-2 border-b"
          style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
        >
          <h3 id="catalog-add-form-title" className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-brand-indigo" /> Insert Direct
            Sourced SKU
          </h3>
          <button
            onClick={onClose}
            className="text-content-secondary hover:text-content-primary cursor-pointer"
            type="button"
            aria-label="Close add SKU form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 text-left">
              <label htmlFor="vendor" className="text-content-secondary font-semibold uppercase">
                Vendor
              </label>
              <Controller
                name="vendor"
                control={control}
                render={({ field }) => (
                  <Select id="vendor" value={field.value} onChange={field.onChange}>
                    <option value="HPE">HPE</option>
                    <option value="Dell">Dell</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Juniper">Juniper</option>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1 text-left">
              <label htmlFor="type" className="text-content-secondary font-semibold uppercase">
                Category
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select id="type" value={field.value} onChange={field.onChange}>
                    <option value="Processor">Processor</option>
                    <option value="GPU">GPU</option>
                    <option value="Memory">Memory</option>
                    <option value="Drive">Drive</option>
                    <option value="Chassis">Chassis</option>
                    <option value="Network Adapter">Network Adapt.</option>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="partNumber" className="text-content-secondary font-semibold uppercase">
              Part Number ID
            </label>
            <input
              id="partNumber"
              type="text"
              data-testid="input-partNumber"
              {...register("partNumber")}
              placeholder="e.g. P40445-B21"
              className={`w-full p-2.5 bg-surface-canvas/30 border text-content-primary font-mono uppercase transition-colors duration-200 ${
                errors.partNumber ? "border-[#ff3d5a]" : "border-white/6"
              }`}
            />
            <AnimatePresence>
              {errors.partNumber && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                >
                  {errors.partNumber.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="name" className="text-content-secondary font-semibold uppercase">
              Part Description
            </label>
            <input
              id="name"
              type="text"
              data-testid="input-name"
              {...register("name")}
              placeholder="e.g. Intel Gold 6430 32-Core 2.1GHz"
              className={`w-full p-2.5 bg-surface-canvas/30 border text-content-primary transition-colors duration-200 ${
                errors.name ? "border-[#ff3d5a]" : "border-white/6"
              }`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 text-left">
              <label htmlFor="price" className="text-content-secondary font-semibold uppercase">
                Contract Rate ($)
              </label>
              <input
                id="price"
                type="number"
                data-testid="input-price"
                {...register("price", { valueAsNumber: true })}
                placeholder="2450"
                className={`w-full p-2.5 bg-surface-canvas/30 border text-content-primary font-mono transition-colors duration-200 ${
                  errors.price ? "border-[#ff3d5a]" : "border-white/6"
                }`}
              />
              <AnimatePresence>
                {errors.price && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                  >
                    {errors.price.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-1 text-left">
              <label htmlFor="leadTimeDays" className="text-content-secondary font-semibold uppercase">
                Lead Time (Days)
              </label>
              <input
                id="leadTimeDays"
                type="number"
                data-testid="input-leadTimeDays"
                {...register("leadTimeDays", { valueAsNumber: true })}
                placeholder="7"
                className={`w-full p-2.5 bg-surface-canvas/30 border text-content-primary transition-colors duration-200 ${
                  errors.leadTimeDays ? "border-[#ff3d5a]" : "border-white/6"
                }`}
              />
              <AnimatePresence>
                {errors.leadTimeDays && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[#ff3d5a] text-[11px] font-semibold mt-1"
                  >
                    {errors.leadTimeDays.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div
            className="pt-2 border-t flex justify-end gap-2"
            style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Add Part
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
