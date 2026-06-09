import React from 'react';
import { Database, X } from 'lucide-react';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';

interface CatalogAddFormProps {
  onAddSku: (e: React.FormEvent) => void;
  onClose: () => void;
  newVendor: string;
  setNewVendor: (val: string) => void;
  newType: string;
  setNewType: (val: string) => void;
  newPartNo: string;
  setNewPartNo: (val: string) => void;
  newName: string;
  setNewName: (val: string) => void;
  newPrice: string;
  setNewPrice: (val: string) => void;
  newLeadTime: string;
  setNewLeadTime: (val: string) => void;
}

export function CatalogAddForm({
  onAddSku,
  onClose,
  newVendor,
  setNewVendor,
  newType,
  setNewType,
  newPartNo,
  setNewPartNo,
  newName,
  setNewName,
  newPrice,
  setNewPrice,
  newLeadTime,
  setNewLeadTime,
}: CatalogAddFormProps) {
  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fadeIn select-none leading-normal">
      <div
        className="w-full max-w-sm rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: "#090d19",
          borderColor: "rgba(74, 133, 253,0.18)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center justify-between pb-2 border-b"
          style={{ borderColor: "rgba(74, 133, 253,0.06)" }}
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-400" /> Insert Direct
            Sourced SKU
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onAddSku} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">
                Vendor
              </label>
              <Select
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
              >
                <option value="HPE">HPE</option>
                <option value="Dell">Dell</option>
                <option value="Cisco">Cisco</option>
                <option value="Juniper">Juniper</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">
                Category
              </label>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="Processor">Processor</option>
                <option value="Memory">Memory</option>
                <option value="Drive">Drive</option>
                <option value="Chassis">Chassis</option>
                <option value="Network Adapter">Network Adapt.</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase">
              Part Number ID
            </label>
            <input
              type="text"
              value={newPartNo}
              onChange={(e) => setNewPartNo(e.target.value)}
              placeholder="e.g. P40445-B21"
              className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 font-semibold uppercase">
              Part Description
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Intel Gold 6430 32-Core 2.1GHz"
              className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">
                Contract Rate ($)
              </label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="2450"
                className="w-full p-2.5 bg-black/30 border border-white/6 text-white font-mono"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold uppercase">
                Lead Time (Days)
              </label>
              <input
                type="number"
                value={newLeadTime}
                onChange={(e) => setNewLeadTime(e.target.value)}
                placeholder="7"
                className="w-full p-2.5 bg-black/30 border border-white/6 text-white"
                required
              />
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
