import React from "react";
import { Folder, ChevronRight, ChevronDown, Upload } from "lucide-react";
import type { CatalogSKU } from "../../types";

interface TaxonomyTreeProps {
  catalogSkus: CatalogSKU[];
  selectedPath: {
    vendor: string;
    solution: string;
    product: string;
    generation: string;
    chassis: string;
  };
  expandedNodes: Record<string, boolean>;
  onToggleNode: (id: string) => void;
  onSelectPath: (path: {
    vendor: string;
    solution: string;
    product: string;
    generation: string;
    chassis: string;
  }) => void;
  vendors?: any[];
  onSetToast: (
    toast: { message: string; type: "success" | "warn" | "error" } | null,
  ) => void;
}

export function TaxonomyTree({
  catalogSkus,
  selectedPath,
  expandedNodes,
  onToggleNode,
  onSelectPath,
  vendors,
  onSetToast,
}: TaxonomyTreeProps) {
  const selectPathFn = (newPath: typeof selectedPath) => {
    onSelectPath(newPath);
  };

  return (
    <div className="flex-1 select-none pr-0.5 space-y-1 text-[11px]">
      {/* All SKUs node */}
      <button
        onClick={() =>
          selectPathFn({
            vendor: "all",
            solution: "all",
            product: "all",
            generation: "all",
            chassis: "all",
          })
        }
        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition font-semibold ${
          selectedPath.vendor === "all"
            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
            : "text-gray-400 hover:bg-[#10192e] hover:text-white border border-transparent"
        }`}
      >
        <span className="flex items-center gap-2 font-semibold">
          <Folder className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>All Sourced SKUs</span>
        </span>
        <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-indigo-400 font-bold border border-indigo-500/10">
          {catalogSkus.length}
        </span>
      </button>

      {/* Folder list of global partner database stats */}
      <div className="pt-2 space-y-1 text-left">
        <span className="text-[9px] text-gray-500 font-bold font-mono tracking-wider px-2 block uppercase mb-1">
          Global Sourcing Directory
        </span>

        {/* HPE Node (Nested Expandable) */}
        <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
          <div
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
              selectedPath.vendor === "hpe" && selectedPath.solution === "all"
                ? "text-indigo-400 font-bold bg-indigo-500/5"
                : "text-gray-300 hover:bg-white/1.5"
            }`}
          >
            <button
              onClick={() =>
                selectPathFn({
                  vendor: "hpe",
                  solution: "all",
                  product: "all",
                  generation: "all",
                  chassis: "all",
                })
              }
              className="flex-1 text-left flex items-center justify-between font-semibold pr-2"
            >
              <span className="flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>HPE Global Portal</span>
              </span>
              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/10">
                {vendors
                  ?.find((v) => v.shortName === "HPE")
                  ?.catalogItems?.toLocaleString() || "5,812"}
              </span>
            </button>
            <button
              onClick={() => onToggleNode("hpe")}
              className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
            >
              {expandedNodes["hpe"] ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {expandedNodes["hpe"] && (
            <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
              {/* Solution level: Server */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "hpe",
                        solution: "Server",
                        product: "all",
                        generation: "all",
                        chassis: "all",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "hpe" && selectedPath.solution === "Server" && selectedPath.product === "all" ? "text-indigo-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">• Server Solutions</span>
                  </button>
                  <button
                    onClick={() => onToggleNode("hpe_Server")}
                    className="text-gray-500 hover:text-white"
                  >
                    {expandedNodes["hpe_Server"] ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {expandedNodes["hpe_Server"] && (
                  <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                    {/* DL380 Series */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded hover:bg-white/1">
                        <button
                          onClick={() =>
                            selectPathFn({
                              vendor: "hpe",
                              solution: "Server",
                              product: "DL380",
                              generation: "all",
                              chassis: "all",
                            })
                          }
                          className={`flex-1 text-left ${selectedPath.product === "DL380" && selectedPath.generation === "all" ? "text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                        >
                          <span>- DL380 Family</span>
                        </button>
                        <button
                          onClick={() => onToggleNode("hpe_Server_DL380")}
                          className="text-gray-600 hover:text-white"
                        >
                          {expandedNodes["hpe_Server_DL380"] ? (
                            <ChevronDown className="w-2.5 h-2.5" />
                          ) : (
                            <ChevronRight className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>

                      {expandedNodes["hpe_Server_DL380"] && (
                        <div className="pl-3 border-l border-white/5 ml-2 space-y-1 text-[10px]">
                          {/* Gen 11 */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                              <button
                                onClick={() =>
                                  selectPathFn({
                                    vendor: "hpe",
                                    solution: "Server",
                                    product: "DL380",
                                    generation: "Gen11",
                                    chassis: "all",
                                  })
                                }
                                className={`flex-1 text-left ${selectedPath.product === "DL380" && selectedPath.generation === "Gen11" && selectedPath.chassis === "all" ? "text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                              >
                                <span>Gen 11 Range</span>
                              </button>
                              <button
                                onClick={() =>
                                  onToggleNode("hpe_Server_DL380_Gen11")
                                }
                                className="text-gray-650 hover:text-white"
                              >
                                {expandedNodes["hpe_Server_DL380_Gen11"] ? (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronRight className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>

                            {expandedNodes["hpe_Server_DL380_Gen11"] && (
                              <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                <button
                                  onClick={() =>
                                    selectPathFn({
                                      vendor: "hpe",
                                      solution: "Server",
                                      product: "DL380",
                                      generation: "Gen11",
                                      chassis: "sku-4",
                                    })
                                  }
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-4" ? "bg-emerald-500/10 text-status-success font-bold" : "hover:text-white"}`}
                                >
                                  8SFF Main Chassis
                                </button>
                                <button
                                  onClick={() =>
                                    selectPathFn({
                                      vendor: "hpe",
                                      solution: "Server",
                                      product: "DL380",
                                      generation: "Gen11",
                                      chassis: "sku-4-24sff",
                                    })
                                  }
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-4-24sff" ? "bg-emerald-500/10 text-status-success font-bold" : "hover:text-white"}`}
                                >
                                  24SFF High Density
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Gen 11 - DL380a Accelerator */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                              <button
                                onClick={() =>
                                  selectPathFn({
                                    vendor: "hpe",
                                    solution: "Server",
                                    product: "DL380a",
                                    generation: "Gen11",
                                    chassis: "all",
                                  })
                                }
                                className={`flex-1 text-left ${selectedPath.product === "DL380a" && selectedPath.generation === "Gen11" && selectedPath.chassis === "all" ? "text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                              >
                                <span className="text-purple-500 font-semibold">
                                  DL380a Gen11 Accelerator
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  onToggleNode("hpe_Server_DL380a_Gen11")
                                }
                                className="text-gray-655 hover:text-white"
                              >
                                {expandedNodes["hpe_Server_DL380a_Gen11"] ? (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronRight className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>

                            {expandedNodes["hpe_Server_DL380a_Gen11"] && (
                              <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                <button
                                  onClick={() =>
                                    selectPathFn({
                                      vendor: "hpe",
                                      solution: "Server",
                                      product: "DL380a",
                                      generation: "Gen11",
                                      chassis: "sku-hpe-dl380a-g11-4dw",
                                    })
                                  }
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-hpe-dl380a-g11-4dw" ? "bg-purple-500/10 text-purple-500 font-bold" : "hover:text-white"}`}
                                >
                                  4DW GPU CTO Chassis
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Gen 12 */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                              <button
                                onClick={() =>
                                  selectPathFn({
                                    vendor: "hpe",
                                    solution: "Server",
                                    product: "DL380",
                                    generation: "Gen12",
                                    chassis: "all",
                                  })
                                }
                                className={`flex-1 text-left ${selectedPath.product === "DL380" && selectedPath.generation === "Gen12" && selectedPath.chassis === "all" ? "text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                              >
                                <span>Gen 12 Range</span>
                              </button>
                              <button
                                onClick={() =>
                                  onToggleNode("hpe_Server_DL380_Gen12")
                                }
                                className="text-gray-655 hover:text-white"
                              >
                                {expandedNodes["hpe_Server_DL380_Gen12"] ? (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronRight className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>

                            {expandedNodes["hpe_Server_DL380_Gen12"] && (
                              <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                <button
                                  onClick={() =>
                                    selectPathFn({
                                      vendor: "hpe",
                                      solution: "Server",
                                      product: "DL380",
                                      generation: "Gen12",
                                      chassis: "sku-hpe-dl380-gen12-8sff",
                                    })
                                  }
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-hpe-dl380-gen12-8sff" ? "bg-emerald-500/10 text-status-success font-bold" : "hover:text-white"}`}
                                >
                                  8SFF High Power
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Gen 13 Preview */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/1">
                              <button
                                onClick={() =>
                                  selectPathFn({
                                    vendor: "hpe",
                                    solution: "Server",
                                    product: "DL380",
                                    generation: "Gen13",
                                    chassis: "all",
                                  })
                                }
                                className={`flex-1 text-left ${selectedPath.product === "DL380" && selectedPath.generation === "Gen13" && selectedPath.chassis === "all" ? "text-status-success font-bold" : "text-gray-500 hover:text-white"}`}
                              >
                                <span className="text-status-success font-semibold">
                                  Gen 13 Range Preview
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  onToggleNode("hpe_Server_DL380_Gen13")
                                }
                                className="text-gray-650 hover:text-white"
                              >
                                {expandedNodes["hpe_Server_DL380_Gen13"] ? (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronRight className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>

                            {expandedNodes["hpe_Server_DL380_Gen13"] && (
                              <div className="pl-3 space-y-0.5 text-[9.5px] text-gray-500">
                                <button
                                  onClick={() =>
                                    selectPathFn({
                                      vendor: "hpe",
                                      solution: "Server",
                                      product: "DL380",
                                      generation: "Gen13",
                                      chassis: "sku-hpe-dl380-gen13-pref",
                                    })
                                  }
                                  className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-hpe-dl380-gen13-pref" ? "bg-emerald-500/10 text-status-success font-bold" : "hover:text-white"}`}
                                >
                                  Enterprise Preview Chassis
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DL80 Series */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded hover:bg-white/1">
                        <button
                          onClick={() =>
                            selectPathFn({
                              vendor: "hpe",
                              solution: "Server",
                              product: "DL80",
                              generation: "all",
                              chassis: "all",
                            })
                          }
                          className={`flex-1 text-left ${selectedPath.product === "DL80" && selectedPath.generation === "all" ? "text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                        >
                          <span>- DL80 Family</span>
                        </button>
                        <button
                          onClick={() => onToggleNode("hpe_Server_DL80")}
                          className="text-gray-600 hover:text-white"
                        >
                          {expandedNodes["hpe_Server_DL80"] ? (
                            <ChevronDown className="w-2.5 h-2.5" />
                          ) : (
                            <ChevronRight className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>

                      {expandedNodes["hpe_Server_DL80"] && (
                        <div className="pl-3 border-l border-white/5 ml-2 space-y-1 text-[9.5px]">
                          <button
                            onClick={() =>
                              selectPathFn({
                                vendor: "hpe",
                                solution: "Server",
                                product: "DL80",
                                generation: "Gen11",
                                chassis: "sku-hpe-dl80-g11",
                              })
                            }
                            className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-hpe-dl80-g11" ? "bg-emerald-500/10 text-status-success font-bold" : "text-gray-500 hover:text-white"}`}
                          >
                            Gen 11 12LFF Chassis
                          </button>
                          <button
                            onClick={() =>
                              selectPathFn({
                                vendor: "hpe",
                                solution: "Server",
                                product: "DL80",
                                generation: "Gen12",
                                chassis: "sku-hpe-dl80-g12",
                              })
                            }
                            className={`w-full text-left py-0.5 px-1 rounded block truncate ${selectedPath.chassis === "sku-hpe-dl80-g12" ? "bg-emerald-500/10 text-status-success font-bold" : "text-gray-500 hover:text-white"}`}
                          >
                            Gen 12 12LFF Chassis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Solution level: Storage */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "hpe",
                        solution: "Storage",
                        product: "all",
                        generation: "all",
                        chassis: "all",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "hpe" && selectedPath.solution === "Storage" && selectedPath.product === "all" ? "text-indigo-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">• Storage Solutions</span>
                  </button>
                  <button
                    onClick={() => onToggleNode("hpe_Storage")}
                    className="text-gray-500 hover:text-white"
                  >
                    {expandedNodes["hpe_Storage"] ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {expandedNodes["hpe_Storage"] && (
                  <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                    <button
                      onClick={() =>
                        selectPathFn({
                          vendor: "hpe",
                          solution: "Storage",
                          product: "MSA",
                          generation: "all",
                          chassis: "sku-hpe-msa-2060",
                        })
                      }
                      className={`w-full text-left py-1 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.product === "MSA" ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                    >
                      - MSA 2060 Array Chassis
                    </button>
                  </div>
                )}
              </div>

              {/* Solution level: Networking */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "hpe",
                        solution: "Networking",
                        product: "all",
                        generation: "all",
                        chassis: "all",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "hpe" && selectedPath.solution === "Networking" && selectedPath.product === "all" ? "text-indigo-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">
                      • Networking Solutions
                    </span>
                  </button>
                  <button
                    onClick={() => onToggleNode("hpe_Networking")}
                    className="text-gray-500 hover:text-white"
                  >
                    {expandedNodes["hpe_Networking"] ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {expandedNodes["hpe_Networking"] && (
                  <div className="pl-3 border-l border-white/5 ml-2 pb-1 space-y-1 text-[10.5px]">
                    <button
                      onClick={() =>
                        selectPathFn({
                          vendor: "hpe",
                          solution: "Networking",
                          product: "Aruba",
                          generation: "all",
                          chassis: "sku-hpe-aruba-10000",
                        })
                      }
                      className={`w-full text-left py-1 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.product === "Aruba" ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-gray-500 hover:text-white"}`}
                    >
                      - Aruba CX Dist. Services Switch
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cisco Node (Nested Expandable) */}
        <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
          <div
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
              selectedPath.vendor === "cisco" && selectedPath.solution === "all"
                ? "text-purple-400 font-bold bg-purple-500/5"
                : "text-gray-300 hover:bg-white/1.5"
            }`}
          >
            <button
              onClick={() =>
                selectPathFn({
                  vendor: "cisco",
                  solution: "all",
                  product: "all",
                  generation: "all",
                  chassis: "all",
                })
              }
              className="flex-1 text-left flex items-center justify-between font-semibold pr-2"
            >
              <span className="flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                <span>CISCO Systems</span>
              </span>
              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-purple-400 font-bold border border-purple-500/10">
                {vendors
                  ?.find((v) => v.shortName === "Cisco")
                  ?.catalogItems?.toLocaleString() || "3,104"}
              </span>
            </button>
            <button
              onClick={() => onToggleNode("cisco")}
              className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
            >
              {expandedNodes["cisco"] ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {expandedNodes["cisco"] && (
            <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "cisco",
                        solution: "Server",
                        product: "UCS",
                        generation: "all",
                        chassis: "all",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "cisco" && selectedPath.solution === "Server" ? "text-purple-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">• UCS Compute Series</span>
                  </button>
                </div>

                <div className="pl-3 border-l border-white/5 ml-2 pb-0.5 space-y-1 text-[10.5px]">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "cisco",
                        solution: "Server",
                        product: "UCS",
                        generation: "all",
                        chassis: "sku-14",
                      })
                    }
                    className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === "sku-14" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-gray-500 hover:text-white"}`}
                  >
                    - UCS C240 M7 CTO Chassis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dell Node (Nested Expandable) */}
        <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
          <div
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
              selectedPath.vendor === "dell" && selectedPath.solution === "all"
                ? "text-indigo-400 font-bold bg-indigo-500/5"
                : "text-gray-300 hover:bg-white/1.5"
            }`}
          >
            <button
              onClick={() =>
                selectPathFn({
                  vendor: "dell",
                  solution: "all",
                  product: "all",
                  generation: "all",
                  chassis: "all",
                })
              }
              className="flex-1 text-left flex items-center justify-between font-semibold pr-2"
            >
              <span className="flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                <span>DELL EMC Solutions</span>
              </span>
              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-sky-400 font-bold border border-sky-500/10">
                {vendors
                  ?.find((v) => v.shortName === "Dell")
                  ?.catalogItems?.toLocaleString() || "4,831"}
              </span>
            </button>
            <button
              onClick={() => onToggleNode("dell")}
              className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
            >
              {expandedNodes["dell"] ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {expandedNodes["dell"] && (
            <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "dell",
                        solution: "Server",
                        product: "R760",
                        generation: "all",
                        chassis: "all",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "dell" && selectedPath.solution === "Server" ? "text-sky-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">• PowerEdge Clusters</span>
                  </button>
                </div>

                <div className="pl-3 border-l border-white/5 ml-2 pb-0.5 space-y-1 text-[10.5px]">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "dell",
                        solution: "Server",
                        product: "R760",
                        generation: "all",
                        chassis: "sku-9",
                      })
                    }
                    className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === "sku-9" ? "bg-sky-500/10 text-sky-400 font-bold" : "text-gray-500 hover:text-white"}`}
                  >
                    - PowerEdge R760 8SFF Chassis
                  </button>
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "dell",
                        solution: "Server",
                        product: "R760",
                        generation: "all",
                        chassis: "sku-9-24sff",
                      })
                    }
                    className={`w-full text-left py-0.5 px-1.5 rounded hover:bg-white/1 block truncate ${selectedPath.chassis === "sku-9-24sff" ? "bg-sky-500/10 text-sky-400 font-bold" : "text-gray-500 hover:text-white"}`}
                  >
                    - PowerEdge 24SFF HighDensity
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Juniper Node (Nested Expandable) */}
        <div className="space-y-0.5 border border-white/5 bg-black/10 rounded-lg p-1.5">
          <div
            className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition text-left ${
              selectedPath.vendor === "juniper" &&
              selectedPath.solution === "all"
                ? "text-emerald-400 font-bold bg-emerald-500/5"
                : "text-gray-350 hover:bg-white/1.5"
            }`}
          >
            <button
              onClick={() =>
                selectPathFn({
                  vendor: "juniper",
                  solution: "all",
                  product: "all",
                  generation: "all",
                  chassis: "all",
                })
              }
              className="flex-1 text-left flex items-center justify-between font-semibold pr-2"
            >
              <span className="flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>JUNIPER Networks</span>
              </span>
              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-emerald-100 font-bold border border-emerald-500/10">
                {vendors
                  ?.find((v) => v.shortName === "Juniper")
                  ?.catalogItems?.toLocaleString() || "1,420"}
              </span>
            </button>
            <button
              onClick={() => onToggleNode("juniper")}
              className="p-1 hover:text-white text-gray-500 rounded hover:bg-white/5 dynamic-toggle transition"
            >
              {expandedNodes["juniper"] ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {expandedNodes["juniper"] && (
            <div className="pl-3.5 border-l border-white/5 ml-3 pb-1 space-y-1">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-white/1">
                  <button
                    onClick={() =>
                      selectPathFn({
                        vendor: "juniper",
                        solution: "Networking",
                        product: "QFX",
                        generation: "all",
                        chassis: "sku-16",
                      })
                    }
                    className={`flex-1 text-left flex items-center gap-1.5 ${selectedPath.vendor === "juniper" && selectedPath.solution === "Networking" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-semibold">
                      • Switch Fabric Systems
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sourcing Ingest Excel/CSV block */}
      <div className="p-3 bg-black/30 border border-white/5 rounded-lg space-y-2 pt-2.5">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block text-left">
          Bulk Taxonomy Ingest
        </span>
        <p className="text-[10px] text-gray-500 leading-normal text-left">
          Sync pricing schemas directly from partner Excel workbooks or CSV
          sweeps.
        </p>
        <button
          type="button"
          onClick={() =>
            onSetToast({
              message:
                "Ready. Drop your workbook files directly inside the Solution Architecture Builder's intake drawer.",
              type: "success",
            })
          }
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold transition cursor-pointer text-[10.5px]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Ingest Sheets</span>
        </button>
      </div>
    </div>
  );
}
